-- Copyright (C) 2021-present 8x8, Inc.

local jid = require "util.jid";
local parse = require "net.url".parseQuery;
local wrap_async_run = module:require "util".wrap_async_run;
local stanza = require "util.stanza";
local auth = module:require "token_auth".new(module, "notification_");

local accepted_notification_types = module:get_option_array("notification_accepted_types");
if (not accepted_notification_types) then
	module:log("error", "No notification types are specified. Notifications module will not be loaded");
	return;
end;

local function contains_value(arr, value)
	for i, v in ipairs(arr) do
		if v == value then
			return true;
		end
	end
	return false
end

--- Finds and returns room by its jid
-- @param room_jid the room jid to search in the muc component
-- @return returns room if found or nil
local function get_room_from_jid(room_jid)
	local _, host = jid.split(room_jid);
	local component = hosts[host];
	if component then
		local muc = component.modules.muc
		if muc and rawget(muc,"rooms") then
			-- We're running 0.9.x or 0.10 (old MUC API)
			return muc.rooms[room_jid];
		elseif muc and rawget(muc,"get_room_from_jid") then
			-- We're running >0.10 (new MUC API)
			return muc.get_room_from_jid(room_jid);
		else
			return
		end
	end
end

function handle_room_notification (event)
	if not event.request.url.query then
		module:log("error", "Notification received without proper query");
		return 400;
	end

	--Validate room jid
	local params = parse(event.request.url.query);
	local room_jid = params["spot-room-muc-url"];
	if not room_jid then
		module:log("error", "Notification received, but room was not specified. The 'spot-room-muc-url' query parameter must be set.");
		return 400;
	end

	-- Validate notification type
	local notification_type = params["type"];
	if not notification_type then
		module:log("error", "Notification received, but type was not specified. The 'type' query parameter must be set.");
		return 400;
	end
	if (not contains_value(accepted_notification_types, notification_type)) then
		module:log("error", "Invalid notification type %s", notification_type);
		return 400;
	end

	local session = {};
	session.auth_token = event.request.headers["authorization"];
	local prefixStart, prefixEnd = session.auth_token:find("Bearer ");
    if prefixStart ~= 1 then
		module:log("error", "Invalid authorization header format. The header must start with the string 'Bearer '");
		return 403
	end
	session.auth_token = session.auth_token:sub(prefixEnd + 1);

	local token_valid, err1, err2 = auth:process_and_verify_token(session)

	if not token_valid then
		module:log("error", "Error validating token: %s; %s", err1, err2);
		return 403;
	end

	-- If the provided room conference doesn't exist then we
	-- can't broadcast a notification to the participants
	local room = get_room_from_jid(room_jid);
	if not room then
		module:log("error", "No room found %s. Cannot send notification of type %s", room_jid, notification_type);
		return 404;
	end

	-- Build and send notification message
	local notification_message = stanza.message():tag(notification_type, {xmlns = "jitsi.org/spot"});
	if event.request.body ~= nil and string.len(event.request.body) > 0 then
		notification_message = notification_message:text(event.request.body);
	end
	room:broadcast_message(notification_message);

	return 200;
end

function handle_get(event)
    event.response.headers.content_type = "text/html";

    return [[<!DOCTYPE html><html><head><title>Notifications</title></head><body>
        <p>It works!</p>
        </body></html>]];
end

module:log("debug", "Loading muc_notifications service");
module:depends("http");
module:provides("http", {
	default_path = "/notifications";
	name = "notifications";
	route = {
		["POST"] = function (event) return wrap_async_run(event, handle_room_notification) end;
		["POST /"] = function (event) return wrap_async_run(event, handle_room_notification) end;
		["GET"] = handle_get;
		["GET /"] = handle_get;
	};
});
module:log("debug", "Loaded muc_notifications module");
