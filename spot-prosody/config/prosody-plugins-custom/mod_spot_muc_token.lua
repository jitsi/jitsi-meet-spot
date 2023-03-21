-- Token authentication
-- Copyright (C) 2015-present 8x8, Inc.

local log = module._log;
local host = module.host;
local st = require "util.stanza";
local is_admin = require "core.usermanager".is_admin;
local jid = require "util.jid";


local parentHostName = string.gmatch(tostring(host), "%w+.(%w.+)")();
if parentHostName == nil then
	log("error", "Failed to start - unable to get parent hostname");
	return;
end

local parentCtx = module:context(parentHostName);
if parentCtx == nil then
	log("error",
		"Failed to start - unable to get parent context for host: %s",
		tostring(parentHostName));
	return;
end

local appId = module:get_option_string("app_id");
local appSecret = module:get_option_string("app_secret");
local allowEmptyToken = module:get_option_boolean("allow_empty_token");

log("debug",
	"%s - starting MUC token verifier app_id: %s app_secret: %s allow empty: %s",
	tostring(host), tostring(appId), tostring(appSecret),
	tostring(allowEmptyToken));


--- Verifies room name and domain if necesarry.
-- Checks configs and if necessary checks the room name extracted from
-- room_address against the one saved in the session when token was verified.
-- Also verifies domain name from token against the domain in the room_address,
-- if enableDomainVerification is enabled.
-- @param session the current session
-- @param room_address the whole room address as received
-- @return returns true in case room was verified or there is no need to verify
--         it and returns false in case verification was processed
--         and was not successful
function verify_room(session, room_address)
    if allowEmptyToken and session.auth_token == nil then
        module:log(
            "debug",
            "Skipped room token verification - empty tokens are allowed");
        return true;
    end

    -- extract room name using all chars, except the not allowed ones
    local room,_,_ = jid.split(room_address);
    if room == nil then
        log("error",
            "Unable to get name of the MUC room ? to: %s", room_address);
        return true;
    end

    local auth_room = session.spot_room;
    -- if auth_room is missing, this means user is anonymous (no token for
    -- its domain) we let it through, jicofo is verifying creation domain
    if auth_room and room ~= string.lower(auth_room) and auth_room ~= '*' then
        return false;
    end

    return true;
end

local function verify_user(session, stanza)
	log("debug", "Session token: %s, session room: %s",
		tostring(session.auth_token),
		tostring(session.spot_room));

	-- token not required for admin users
	local user_jid = stanza.attr.from;
	if is_admin(user_jid) then
		log("debug", "Token not required from admin user: %s", user_jid);
		return nil;
	end

    log("debug",
        "Will verify token for user: %s, room: %s ", user_jid, stanza.attr.to);
    if not verify_room(session, stanza.attr.to) then
        log("error", "Token %s not allowed to join: %s",
            tostring(session.auth_token), tostring(stanza.attr.to));
        session.send(
            st.error_reply(
                stanza, "cancel", "not-allowed", "Room and token mismatched"));
        return false; -- we need to just return non nil
    end
	log("debug",
        "allowed: %s to enter/create room: %s", user_jid, stanza.attr.to);
end

module:hook("muc-room-pre-create", function(event)
	local origin, stanza = event.origin, event.stanza;
	log("debug", "pre create: %s %s", tostring(origin), tostring(stanza));
	return verify_user(origin, stanza);
end);

module:hook("muc-occupant-pre-join", function(event)
	local origin, room, stanza = event.origin, event.room, event.stanza;
	log("debug", "pre join: %s %s", tostring(room), tostring(stanza));
	return verify_user(origin, stanza);
end);
