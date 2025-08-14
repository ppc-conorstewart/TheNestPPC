// FULL COMPETENCY MATRIX (100% full, no omissions)
const competencies = [
  // Level 1
  {
    label: "Project Technician I",
    groups: [
      {
        group: "Equipment Maintenance",
        items: [
          "Can identify and locate a Y-Strainer.",
          "Understands the purpose of engine oil and basic maintenance schedules.",
          "Can identify the engine oil filter.",
          "Knows the basic function of a hydraulic system.",
          "Can describe the purpose of depressurizing a hydraulic system.",
          "Displays an eager attitude to learn and attentively observes daily maintenance checks and practices."
        ]
      },
      {
        group: "Housekeeping and Work Ethic",
        items: [
          "Understands the importance of maintaining a clean workspace.",
          "Can follow instructions to keep the Grease Seacan, Office Trailer, and Crew Trucks tidy.",
          "Can clean the Wellhead area under supervision.",
          "Remains attentive in learning what tools and supplies are necessary for the job.",
          "Demonstrates punctuality and reliability.",
          "Shows a willingness to learn and take direction."
        ]
      },
      {
        group: "Customer Service and Communication",
        items: [
          "Can comprehend and follow simple radio instructions.",
          "Understands basic radio etiquette (e.g., waiting for acknowledgment).",
          "Can communicate basic information to team members.",
          "Demonstrates respect and attentiveness in communication.",
          "Shows willingness to ask questions when unsure."
        ]
      },
      {
        group: "Operational Knowledge",
        items: [
          "Recognizes basic downhole tools.",
          "Understands the general purpose of downhole operations.",
          "Can describe the purpose of a frac completions pad in simple terms.",
          "Aware of basic safety precautions for operations.",
          "Understands who to report to in various operational scenarios."
        ]
      },
      {
        group: "System Installation or Tear Down",
        items: [
          "Observes crane hand signals used by others.",
          "Understands the need for proper preparation before system tear down.",
          "Basic knowledge of equipment inspection prior to installation. (Ring grooves, hyd. fittings, body lube caps)",
          "Assists in basic equipment organization during installation or tear down.",
          "Can follow instructions for rig-out preparation.",
          "Recognizes the importance of delegation but relies on others for direction."
        ]
      },
      {
        group: "Valve Service",
        items: [
          "Takes part, observing and assisting in operational grease procedure under supervision.",
          "Possesses an understanding for the function of basic valve components. (e.g., grease ports, hyd. fittings)"
        ]
      }
    ]
  },
  // Level 2
  {
    label: "Project Technician II",
    groups: [
      {
        group: "Equipment Maintenance",
        items: [
          "Can check and clean a Y-Strainer under supervision.",
          "Can assist in changing engine oil with guidance.",
          "Can assist in replacing the engine oil filter.",
          "Identifies common hydraulic issues and reports them.",
          "Can depressurize a hydraulic system under direct supervision.",
          "Able to complete all daily maintenance checks and practices under supervision."
        ]
      },
      {
        group: "Housekeeping and Work Ethic",
        items: [
          "Maintains consistent cleanliness in the Grease Seacan and Office Trailer.",
          "Can independently clean and organize the Wellhead area.",
          "Has a basic understanding of tool and supply inventory.",
          "Takes initiative to improve workspace organization.",
          "Demonstrates consistent reliability and effort.",
          "Begins to mentor Level 1 team members on basic tasks."
        ]
      },
      {
        group: "Customer Service and Communication",
        items: [
          "Can communicate clearly on the radio with minimal errors.",
          "Relays instructions effectively to third-party services under supervision.",
          "Demonstrates increased confidence in team discussions.",
          "Knows how to escalate issues to the right personnel.",
          "Starts providing feedback to peers during operations."
        ]
      },
      {
        group: "Operational Knowledge",
        items: [
          "Can describe common downhole operations and their functions.",
          "Understands the basic sequence of a frac completions pad.",
          "Recognizes potential risks in operations and reports them.",
          "Knows how to access and use operational documentation.",
          "Can identify and explain key tools used in the operation."
        ]
      },
      {
        group: "System Installation or Tear Down",
        items: [
          "Can perform basic crane hand signals under supervision.",
          "Prepares basic tools and equipment for installation or tear down.",
          "Starts contributing to rig-out preparation planning.",
          "Participates in team discussions about delegation.",
          "Assists in timeline preparation with guidance."
        ]
      },
      {
        group: "Valve Service",
        items: [
          "Assists in performing grease procedure under supervision.",
          "Understands the importance of preventative maintenance.",
          "Possesses knowledge of basic valve components and functions.",
          "Observes and assists during times of troubleshooting and/or repairs."
        ]
      }
    ]
  },
  // Level 3
  {
    label: "Project Technician III",
    groups: [
      {
        group: "Equipment Maintenance",
        items: [
          "Independently checks and cleans a Y-Strainer.",
          "Changes engine oil with minimal supervision.",
          "Replaces the engine oil filter independently.",
          "Diagnoses simple hydraulic issues and proposes solutions.",
          "Safely depressurizes a hydraulic system with minimal oversight.",
          "Conducts daily maintenance checks and practices on all on-site equipment with minimal supervision."
        ]
      },
      {
        group: "Housekeeping and Work Ethic",
        items: [
          "Independently maintains high cleanliness standards in all areas.",
          "Keeps the workspace organized and functional.",
          "Assists in maintaining an accurate inventory of tools and supplies.",
          "Demonstrates a proactive approach to task completion.",
          "Serves as a role model for punctuality and work ethic.",
          "Encourages and motivates team members to uphold standards."
        ]
      },
      {
        group: "Customer Service and Communication",
        items: [
          "Consistently communicates effectively via radio.",
          "Coordinates with third-party services confidently and accurately.",
          "Proactively addresses communication gaps in the team.",
          "Demonstrates leadership in on-site discussions.",
          "Begins to aid in the management of customer expectations and/or complaints.",
          "Provides clear and constructive feedback to peers."
        ]
      },
      {
        group: "Operational Knowledge",
        items: [
          "Explains the functions of various downhole operations in detail.",
          "Can outline the sequence of a frac completions pad accurately.",
          "Has a strong understanding of safety standards. Implements and guides junior staff to follow safe work practices.",
          "Identifies operational inefficiencies and suggests improvements.",
          "Ensures compliance with operational procedures.",
          "Mentors’ others on operational concepts."
        ]
      },
      {
        group: "System Installation or Tear Down",
        items: [
          "Demonstrates proficiency in crane hand signals.",
          "Leads preparation for installation or tear down.",
          "Contributes to the delegation of tasks within the team.",
          "Produces a draft timeline for rig-out preparation.",
          "Thinks ahead to anticipate challenges during operations."
        ]
      },
      {
        group: "Valve Service",
        items: [
          "Confidently conducts grease procedure (QP-701) with minimal or no guidance.",
          "Assists in the troubleshooting process and possesses the knowledge to conduct small repairs with some guidance.",
          "Has an intermediate knowledge level and understanding of valve components and their functions.",
          "Actively assists in out-of-scope valve services. (e.g., flushing valves)"
        ]
      }
    ]
  },
  // Level 4
  {
    label: "Project Technician IV",
    groups: [
      {
        group: "Equipment Maintenance",
        items: [
          "Troubleshoots and resolves hydraulic issues independently.",
          "Conducts preventive maintenance on all equipment.",
          "Mentors’ others on Y-Strainer cleaning and oil changes.",
          "Ensures all hydraulic repairs are performed safely.",
          "Documents maintenance activities comprehensively."
        ]
      },
      {
        group: "Housekeeping and Work Ethic",
        items: [
          "Sets and enforces high housekeeping standards.",
          "Implements organizational systems to maintain workspace efficiency.",
          "Maintains an accurate inventory of on-site tools and supplies. Properly reports tool deficiencies and supply needs.",
          "Exhibits exemplary work ethic and professionalism.",
          "Encourages team accountability for cleanliness and tasks.",
          "Oversees housekeeping and work ethic training for junior staff."
        ]
      },
      {
        group: "Customer Service and Communication",
        items: [
          "Handles complex communications with third-party services effectively.",
          "Leads radio communications during critical operations.",
          "Resolves conflicts and miscommunications on-site.",
          "Manages customer expectations and complaints in a prompt and professional manner.",
          "Builds team confidence through clear guidance.",
          "Communicates strategic objectives to the team."
        ]
      },
      {
        group: "Operational Knowledge",
        items: [
          "Develops and delivers training on downhole operations.",
          "Identifies and mitigates operational risks proactively.",
          "Contributes to strategic planning for frac completions.",
          "Ensures team compliance with all operational standards.",
          "Serves as a technical resource for complex operations."
        ]
      },
      {
        group: "System Installation or Tear Down",
        items: [
          "Supervises crane operations and hand signaling.",
          "Delegates tasks effectively across the team.",
          "Produces a detailed timeline for rig-out preparation.",
          "Ensures team readiness for installation or tear down.",
          "Solves unexpected challenges during operations."
        ]
      },
      {
        group: "Valve Service",
        items: [
          "Proficiently conducts grease procedure (QP-701) and provides training and guidance on valve maintenance to other team members.",
          "Possesses a strong knowledge of valve components and their functions.",
          "Ability to perform the troubleshooting process and possesses the knowledge to conduct basic – advanced services/repairs.",
          "Confidently performs out of scope valve services. (e.g., valve flushes)"
        ]
      }
    ]
  },
  // Level 5
  {
    label: "Site Supervisor V",
    groups: [
      {
        group: "Equipment Maintenance",
        items: [
          "Innovates and improves maintenance procedures.",
          "Handles advanced troubleshooting and repairs.",
          "Coaches team members on complex hydraulic systems.",
          "Develops training materials for equipment maintenance.",
          "Ensures compliance with industry standards for maintenance."
        ]
      },
      {
        group: "Housekeeping and Work Ethic",
        items: [
          "Designs systems to sustain long-term cleanliness and efficiency.",
          "Inspires a culture of excellence in work ethic.",
          "Leads by example in all aspects of housekeeping.",
          "Monitors and evaluates team performance in housekeeping and work ethic.",
          "Provides actionable feedback to improve team standards."
        ]
      },
      {
        group: "Customer Service and Communication",
        items: [
          "Serves as the primary point of contact for external communications.",
          "Manages customer expectations effectively and maintains professionalism when under pressure.",
          "Resolves customer complaints/issues in a prompt and professional manner.",
          "Demonstrates mastery in on-site communication during emergencies.",
          "Mentors’ others in communication and leadership.",
          "Handles high-stakes situations with confidence and clarity.",
          "Develops communication protocols for the team."
        ]
      },
      {
        group: "Operational Knowledge",
        items: [
          "Leads strategic planning for complex downhole operations.",
          "Ensures all team members are held to industry and PPC safety standards. Enforces safe work practices.",
          "Creates advanced training programs for operational knowledge.",
          "Innovates procedures to enhance operational efficiency.",
          "Advises leadership on operational best practices.",
          "Represents the team in high-level operational discussions."
        ]
      },
      {
        group: "System Installation or Tear Down",
        items: [
          "Directs entire installation or tear down operations.",
          "Develops comprehensive timelines and contingency plans.",
          "Delegates responsibilities with precision.",
          "Anticipates and resolves advanced operational challenges.",
          "Drives innovation in system installation and tear down processes."
        ]
      },
      {
        group: "Valve Service",
        items: [
          "Accurately and consistently performs grease procedure (QP-701) to ensure proper preventative maintenance on all PPC valves.",
          "Provides training and oversight during valve service and repairs. Shares knowledge of maintenance, grease procedures, and repairs to team members.",
          "Displays extensive knowledge of internal valve components. Capable of advanced valve services and repairs.",
          "Skilled in troubleshooting and diagnosing valve issues and deficiencies."
        ]
      }
    ]
  }
];
export default competencies;