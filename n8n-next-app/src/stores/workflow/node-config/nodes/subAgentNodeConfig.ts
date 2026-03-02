import { NodeConfigProps, NodeObjType } from "./types/node-types";

export function subAgentNodeConfig(props: NodeConfigProps) {
  const { id, label, position, icon } = props;

  const subAgentNode: NodeObjType = {
    id: id,
    type: "subAgent",
    position,
    data: {
      label: label || "Sub-Agent",
      icon: icon || "/icons/chatbot.png",
      sub: "worker Agent",
      instruction: "",
      model: "",
    },
    constraints: {
      nodeHandles: [
        {
          name: "left",
          type: "target",
          LinkTo: [
            {
              nodeName: "agent",
              handlePosition: "right",
            },
          ],
        },
        {
          name: "right",
          type: "source",
          LinkTo: [
            {
              nodeName: "agent",
              handlePosition: "left",
            },
            {
              nodeName: "outputNode",
              handlePosition: "left",
            },
          ],
        },
      ],
    },
  };

  return subAgentNode;
}
