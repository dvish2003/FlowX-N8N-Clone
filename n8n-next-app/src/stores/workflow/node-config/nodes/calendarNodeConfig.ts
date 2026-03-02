import { NodeConfigProps, NodeObjType } from "./types/node-types"

export function calendarNodeConfig(props: NodeConfigProps) {

const {id,label,icon,position}=props;

const calendarConfigNode:NodeObjType={
    id:id,
    type:'calendarNode',
    position,
    category:'app',
    data:{
        label,
        icon,
        ui:{},
        triggers:[
            {
                id:"calendar-event_created",
                name:"Event Created",
                description:"Triggers when a new event is created in the calendar.",
                
            },
        ],
        action:[
           {
             id:"calender_create_event",
            name:"Create Event",
        triggered:false           }
        ]
    },
    constraints:{
        nodeHandles:[
            {
                name:'left',
                type:'target',
                LinkTo:[{
                    nodeName:'agent',
                    handlePosition:'right'
                }]
            },
            {
                name:'right',
                type:'source',
                LinkTo:[{
                    nodeName:'agent',
                    handlePosition:'left'
                },
                {
                    nodeName:'outputNode',
                    handlePosition:'left'
                }]
            }
        ]
    },
    
} as NodeObjType;

return calendarConfigNode;

}