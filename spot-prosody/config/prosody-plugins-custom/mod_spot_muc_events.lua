-- Copyright (C) 2021-present 8x8, Inc.

local socket = require "socket";
local http = require "net.http";
local json = require "cjson";
local jid = require "util.jid";
local timer = require "util.timer";
local array = require "util.array";
local jwt = module:require "luajwtjitsi";

local ASAPKeyPath
= module:get_option_string("asap_key_path", '/config/certs/asap.key');

local ASAPKeyId
= module:get_option_string("asap_key_id", 'spot-prosody-dev-2019-08-07');

local ASAPIssuer
= module:get_option_string("asap_issuer", 'SPOT');

local ASAPAudience
= module:get_option_string("asap_audience", 'SPOT');

local ASAPTTL
= module:get_option_number("asap_ttl", 3600);

local ASAPTTL_THRESHOLD
= module:get_option_number("asap_ttl_threshold", 600);

local ASAPKey;

-- Read ASAP key once on module startup
local f = io.open(ASAPKeyPath, "r");
if f then
    ASAPKey = f:read("*all");
    f:close();
    if not ASAPKey then
        module:log("warn", "No ASAP Key read, disabling spot_muc_events plugin");
        return
    end
else
    module:log("warn", "Error reading ASAP Key, disabling spot_muc_events plugin");
    return
end

local roomCacheSize = module:get_option_number("spot_muc_snapshot_cache_size", 52000);
local function onCacheEvict(evictedKey, evictedValue)
    module:log("error", "Unexpected cache evict, this could lead to errors! For key %s, and value %s", evictedKey, evictedValue);
end

local roomCache = require "util.cache".new(roomCacheSize, onCacheEvict);

local jwtKeyCacheSize = module:get_option_number("spot_jwt_pubkey_cache_size", 128);
local jwtKeyCache = require "util.cache".new(jwtKeyCacheSize);

local timerInterval = module:get_option_number("spot_muc_snapshot_timer_interval", 3600);

local eventURL
= module:get_option_string("spot_muc_events_url", 'http://localhost:1234');

local http_headers = {
    ["Content-Type"] = "application/json"
};

local function round(num, numDecimalPlaces)
    local mult = 10 ^ (numDecimalPlaces or 0)
    return math.floor(num * mult + 0.5) / mult
end

local function cb(content_, code_, response_, request_)
    if code_ == 200 or code_ == 204 then
        module:log("debug", "URL Callback: Code %s, Content %s, Request (host %s, path %s, body %s), Response: %s",
            code_, content_, request_.host, request_.path, request_.body, response_);
    else
        module:log("warn", "URL Callback non successful: Code %s, Content %s, Request: %s, Response (code %s, body %s)",
            code_, content_, request_, response_.code, response_.body);
    end
end

local function generateToken(audience)
    audience = audience or ASAPAudience
    local t = os.time()
    local err
    local exp_key = 'asap_exp.' .. audience
    local token_key = 'asap_token.' .. audience
    local exp = jwtKeyCache:get(exp_key)
    local token = jwtKeyCache:get(token_key)
    local subject = '*'

    --if we find a token and it isn't too far from expiry, then use it
    if token ~= nil and exp ~= nil then
        exp = tonumber(exp)
        if (exp - t) > ASAPTTL_THRESHOLD then
            return token
        end
    end

    --expiry is the current time plus TTL
    exp = t + ASAPTTL
    local payload = {
        iss = ASAPIssuer,
        aud = audience,
        nbf = t,
        exp = exp,
        sub = subject
    }

    -- encode
    local alg = "RS256"
    token, err = jwt.encode(payload, ASAPKey, alg, { kid = ASAPKeyId })
    if not err then
        token = 'Bearer ' .. token
        jwtKeyCache:set(exp_key, exp)
        jwtKeyCache:set(token_key, token)
        return token
    else
        return ''
    end
end

local function sendEvent(type, room_jid, endpoints)
    local event_ts = round(socket.gettime() * 1000);

    local out_event = {
        ["roomId"] = room_jid,
        ["event_type"] = type,
        ["endpoints"] = endpoints,
        ["event_ts"] = event_ts
    }
    module:log("debug", "Sending event %s", out_event);

    local headers = http_headers or {}
    headers['Authorization'] = generateToken()

    http.request(eventURL, {
        headers = headers,
        method = "POST",
        body = json.encode(out_event)
    }, cb);
end

local function processEvent(type, event)
    local room = event.room;
    local room_jid = jid.node(room.jid);
    local who_jid = event.occupant.jid;
    local nick = event.occupant.nick;
    local resource = nick:match("/.*");

    module:log("debug", "Spot room id %s Endpoint (type %s, id %s) Event type %s", room_jid, resource, who_jid, type);

    local function activeEndpoints(endpoint)
        local eId = endpoint['endpointId'];
        return eId ~= who_jid;
    end

    local endpoints = array {};

    local endpoint = {};
    endpoint['endpointId'] = who_jid;
    endpoint['endpoint_type'] = resource;

    endpoints:push(endpoint);

    local cachedEndpoints = roomCache:get(room_jid);

    if (type == "ParticipantJoined") then
        if cachedEndpoints == nil then
            cachedEndpoints = array {};
        end
        cachedEndpoints:push(endpoint);
    elseif (type == "ParticipantLeft") then
        cachedEndpoints:filter(activeEndpoints);
    end

    roomCache:set(room_jid, cachedEndpoints);
    module:log("debug", "Update cache for room %s having endpoints %s", room_jid, cachedEndpoints);

    sendEvent(type, room_jid, endpoints);
end

local function handleRemoteJoined(event)
    processEvent("ParticipantJoined", event);
end

local function handleRemoteLeft(event)
    processEvent("ParticipantLeft", event);
end

local function processSnapshot()
    for room_jid, endpoints in roomCache:items() do
        sendEvent("Snapshot", room_jid, endpoints);

        if endpoints:length() == 0 then
            roomCache:set(room_jid, nil);
            module:log("debug", "Cleanup cache for room %s", room_jid);
        end
    end
    return timerInterval;
end

timer.add_task(timerInterval, processSnapshot);
module:hook("muc-occupant-joined", handleRemoteJoined);
module:hook("muc-occupant-left", handleRemoteLeft);
