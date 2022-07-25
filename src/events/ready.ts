import type { Event } from "../types";

export default {
  event: "ready",
  execute: async (client) => {
    console.log("Ready!");
    client.user.setActivity("flying dragons!", { type: "WATCHING" });
  },
} as Event<"ready">;
