-- Copyright (C) 2021-present 8x8, Inc.

local new_watchdog = require "util.watchdog".new;
local filters = require "util.filters";
local st = require "util.stanza";

local idle_timeout = module:get_option_number("c2s_idle_timeout", 300);
local ping_timeout = module:get_option_number("c2s_ping_timeout",  30);

function update_watchdog(data, session)
        if session.idle_watchdog then
                session.idle_watchdog:reset();
                session.idle_pinged = nil;
        end
        return data;
end

function check_session(watchdog)
        local session = watchdog.session;
        if session.smacks then
                unwatch_session(session);
                return;
        end
        if not session.idle_pinged then
                session.idle_pinged = true;
                session.send(st.iq({ type = "get", from = module.host, id = "idle-check" })
                                :tag("ping", { xmlns = "urn:xmpp:ping" }));
                return ping_timeout; -- Call us again after ping_timeout
        else
                module:log("info", "Client %q silent for too long, closing...", session.full_jid);
                session:close("connection-timeout");
        end
end


function watch_session(session)
        if not session.idle_watchdog
        and not session.requests then -- Don't watch BOSH connections (BOSH already has timeouts)
                session.idle_watchdog = new_watchdog(idle_timeout, check_session);
                session.idle_watchdog.session = session;
                filters.add_filter(session, "bytes/in", update_watchdog);
        end
end

function unwatch_session(session)
        if session.idle_watchdog then
                filters.remove_filter(session, "bytes/in", update_watchdog);
                session.idle_watchdog:cancel();
                session.idle_watchdog = nil;
        end
end

module:hook("resource-bind", function (event) watch_session(event.session); end);
module:hook("resource-unbind", function (event) unwatch_session(event.session); end);
