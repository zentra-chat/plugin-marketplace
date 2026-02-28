const n = (e) => {
  e.registerChannelType({
    id: "counter-click",
    icon: "zap",
    viewComponent: () => import("./CounterChannelView-B1i5aV0i.js"),
    label: "Counter Click",
    description: "Shared click counter synced by channel messages",
    showHash: !1,
    headerActionIds: ["members"]
  });
};
export {
  n as register
};
//# sourceMappingURL=counter-channel-plugin.js.map
