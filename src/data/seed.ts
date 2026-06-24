// Mock repair cases for the prototype.
//
// Timestamps are generated as offsets from runtime `now`, so time-based UI
// (overdue, due today, deadlines in N hours) always looks right whenever the
// demo is run. All names, addresses and contact details are fictional.

import type { Repair } from '../types'

const H = 3_600_000
const D = 24 * H

export function createSeedRepairs(now: Date): Repair[] {
  const t = now.getTime()
  const iso = (offsetMs: number) => new Date(t + offsetMs).toISOString()

  const repairs: Repair[] = [
    // 1 — EMERGENCY · no heating · vulnerable · ACKNOWLEDGEMENT OVERDUE
    {
      reference: 'RR-2026-0501',
      resident: {
        name: 'Edith Brennan',
        address: 'Flat 2, Beech Court, 14 Sycamore Lane, Riverford, RV2 7HX',
        email: 'e.brennan@example.com',
        phone: '07700 900512',
        vulnerable: true,
      },
      category: 'Heating',
      description:
        'Boiler completely dead since last night — no heating and no hot water at all. I am 78 with a heart condition and the flat is freezing.',
      priority: 'Emergency',
      status: 'Submitted',
      submittedAt: iso(-4 * H),
      acknowledgementDeadline: iso(-2 * H),
      estimatedCompletion: iso(20 * H),
      riskFlags: ['Vulnerable resident (elderly, heart condition)', 'No heating or hot water', 'Acknowledgement overdue'],
      urgentReported: true,
      evidence: [
        { id: 'RR-2026-0501-e1', name: 'boiler-fault-code.jpg', type: 'image', sizeLabel: '1.8 MB', uploadedBy: 'resident' },
      ],
      timeline: [
        {
          id: 'RR-2026-0501-t1',
          timestamp: iso(-4 * H),
          title: 'Repair reported',
          description: 'Reported online via Right to Repair. Resident flagged it as urgent.',
          actor: 'resident',
        },
      ],
      notes: [],
    },

    // 2 — URGENT · damp & mould · vulnerable child · TRIAGED
    {
      reference: 'RR-2026-0498',
      resident: {
        name: 'Marcus Reid',
        address: '41 Hawthorn Road, Riverford, RV3 9LP',
        email: 'm.reid@example.com',
        phone: '07700 900498',
        vulnerable: true,
      },
      category: 'Damp and mould',
      description:
        'Black mould spreading across the bedroom wall and ceiling. My son has asthma and his breathing has got worse over the last few weeks.',
      priority: 'Urgent',
      status: 'Triaged',
      submittedAt: iso(-2 * D),
      acknowledgedAt: iso(-2 * D + 5 * H),
      acknowledgementDeadline: iso(-2 * D + 24 * H),
      estimatedCompletion: iso(5 * D),
      assignedTo: 'Priya Shah (Housing Officer)',
      riskFlags: ['Vulnerable resident — child with asthma', 'Health risk — damp and mould'],
      urgentReported: false,
      evidence: [
        { id: 'RR-2026-0498-e1', name: 'bedroom-mould-wall.jpg', type: 'image', sizeLabel: '2.4 MB', uploadedBy: 'resident' },
        { id: 'RR-2026-0498-e2', name: 'ceiling-corner.jpg', type: 'image', sizeLabel: '1.9 MB', uploadedBy: 'resident' },
      ],
      timeline: [
        { id: 'RR-2026-0498-t1', timestamp: iso(-2 * D), title: 'Repair reported', actor: 'resident' },
        {
          id: 'RR-2026-0498-t2',
          timestamp: iso(-2 * D + 5 * H),
          title: 'Repair acknowledged',
          description: 'Acknowledged by Riverford Borough Council. Target: inspect within 7 days.',
          actor: 'council',
        },
        {
          id: 'RR-2026-0498-t3',
          timestamp: iso(-2 * D + 7 * H),
          title: 'Triaged as Urgent',
          description: 'Damp & mould survey to be booked. Flagged for HHSRS assessment.',
          actor: 'council',
        },
      ],
      notes: [
        {
          id: 'RR-2026-0498-n1',
          timestamp: iso(-2 * D + 7 * H),
          author: 'Priya Shah',
          text: 'Booked damp & mould survey. Given child with asthma, prioritise inspection and provide interim treatment advice.',
        },
      ],
    },

    // 3 — URGENT · plumbing leak · APPOINTMENT BOOKED (tomorrow)
    {
      reference: 'RR-2026-0495',
      resident: {
        name: 'Hannah Clarke',
        address: '8 Willow Gardens, Riverford, RV1 4QD',
        email: 'h.clarke@example.com',
        phone: '07700 900495',
        vulnerable: false,
      },
      category: 'Plumbing',
      description:
        'Steady leak from the pipe under the kitchen sink. Water is collecting in the cupboard — I have a bucket under it but it keeps filling.',
      priority: 'Urgent',
      status: 'Appointment booked',
      submittedAt: iso(-3 * D),
      acknowledgedAt: iso(-3 * D + 3 * H),
      acknowledgementDeadline: iso(-3 * D + 24 * H),
      estimatedCompletion: iso(4 * D),
      appointment: { date: iso(1 * D), window: '08:00–12:00' },
      assignedTo: 'Riverford Direct Labour — Plumbing',
      riskFlags: ['Water damage risk'],
      urgentReported: true,
      evidence: [
        { id: 'RR-2026-0495-e1', name: 'under-sink-leak.jpg', type: 'image', sizeLabel: '2.1 MB', uploadedBy: 'resident' },
      ],
      timeline: [
        { id: 'RR-2026-0495-t1', timestamp: iso(-3 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0495-t2', timestamp: iso(-3 * D + 3 * H), title: 'Repair acknowledged', actor: 'council' },
        {
          id: 'RR-2026-0495-t3',
          timestamp: iso(-3 * D + 6 * H),
          title: 'Triaged as Urgent',
          description: 'Assigned to in-house plumbing team.',
          actor: 'council',
        },
        {
          id: 'RR-2026-0495-t4',
          timestamp: iso(-1 * D),
          title: 'Appointment booked',
          description: 'Plumber booked for tomorrow, 08:00–12:00.',
          actor: 'council',
        },
      ],
      notes: [],
    },

    // 4 — EMERGENCY · electrical · IN PROGRESS · appointment TODAY
    {
      reference: 'RR-2026-0490',
      resident: {
        name: 'Daniel Osei',
        address: '23 Cedar Avenue, Riverford, RV4 2BB',
        email: 'd.osei@example.com',
        phone: '07700 900490',
        vulnerable: false,
      },
      category: 'Electrical',
      description:
        'A socket in the living room sparked and there was a burning smell. We have stopped using it but we are worried it is unsafe.',
      priority: 'Emergency',
      status: 'In progress',
      submittedAt: iso(-20 * H),
      acknowledgedAt: iso(-19 * H),
      acknowledgementDeadline: iso(-18 * H),
      estimatedCompletion: iso(4 * H),
      appointment: { date: iso(2 * H), window: '13:00–17:00' },
      assignedTo: 'Northside Electrical (NICEIC)',
      riskFlags: ['Potential fire risk — electrical fault'],
      urgentReported: true,
      evidence: [
        { id: 'RR-2026-0490-e1', name: 'living-room-socket.jpg', type: 'image', sizeLabel: '1.6 MB', uploadedBy: 'resident' },
      ],
      timeline: [
        { id: 'RR-2026-0490-t1', timestamp: iso(-20 * H), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0490-t2', timestamp: iso(-19 * H), title: 'Repair acknowledged', actor: 'council' },
        {
          id: 'RR-2026-0490-t3',
          timestamp: iso(-18 * H),
          title: 'Triaged as Emergency',
          description: 'Assigned to Northside Electrical for a make-safe visit.',
          actor: 'council',
        },
        {
          id: 'RR-2026-0490-t4',
          timestamp: iso(-17 * H),
          title: 'Appointment booked',
          description: 'Emergency electrician booked for today, 13:00–17:00.',
          actor: 'council',
        },
        {
          id: 'RR-2026-0490-t5',
          timestamp: iso(-1 * H),
          title: 'Work in progress',
          description: 'Electrician on site — circuit isolated and being made safe.',
          actor: 'council',
        },
      ],
      notes: [
        {
          id: 'RR-2026-0490-n1',
          timestamp: iso(-17 * H),
          author: 'James Coyle',
          text: 'Same-day make-safe booked. Circuit isolated pending replacement parts.',
        },
      ],
    },

    // 5 — URGENT (suggested Emergency) · structural · TRIAGED
    {
      reference: 'RR-2026-0487',
      resident: {
        name: 'Susan Whitfield',
        address: 'Flat 9, Oak Tower, 2 Mill Street, Riverford, RV1 8FE',
        email: 's.whitfield@example.com',
        phone: '07700 900487',
        vulnerable: false,
      },
      category: 'Structural',
      description:
        'A large crack has appeared across the bedroom ceiling and it looks like it is bowing slightly. I am worried part of it could come down.',
      priority: 'Urgent',
      status: 'Triaged',
      submittedAt: iso(-4 * D),
      acknowledgedAt: iso(-4 * D + 18 * H),
      acknowledgementDeadline: iso(-4 * D + 24 * H),
      estimatedCompletion: iso(3 * D),
      assignedTo: 'Structural Surveyor (external)',
      riskFlags: ['Possible structural risk — ceiling'],
      urgentReported: false,
      evidence: [
        { id: 'RR-2026-0487-e1', name: 'ceiling-crack.jpg', type: 'image', sizeLabel: '2.8 MB', uploadedBy: 'resident' },
        { id: 'RR-2026-0487-e2', name: 'ceiling-crack.mp4', type: 'video', sizeLabel: '11.2 MB', uploadedBy: 'resident' },
      ],
      timeline: [
        { id: 'RR-2026-0487-t1', timestamp: iso(-4 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0487-t2', timestamp: iso(-4 * D + 18 * H), title: 'Repair acknowledged', actor: 'council' },
        {
          id: 'RR-2026-0487-t3',
          timestamp: iso(-4 * D + 20 * H),
          title: 'Triaged',
          description: 'Structural surveyor to inspect before works are scheduled.',
          actor: 'council',
        },
      ],
      notes: [
        {
          id: 'RR-2026-0487-n1',
          timestamp: iso(-4 * D + 20 * H),
          author: 'Priya Shah',
          text: 'Surveyor inspection required. Resident advised to avoid the room until assessed.',
        },
      ],
    },

    // 6 — URGENT · door won't lock (security) · ACKNOWLEDGED, awaiting triage
    {
      reference: 'RR-2026-0484',
      resident: {
        name: 'Aisha Bello',
        address: '5 Linden Close, Riverford, RV5 3JW',
        email: 'a.bello@example.com',
        phone: '07700 900484',
        vulnerable: false,
      },
      category: 'Doors/windows',
      description:
        'The front door lock is broken and the door will not lock at all. We cannot secure the flat overnight and do not feel safe.',
      priority: 'Urgent',
      status: 'Acknowledged',
      submittedAt: iso(-1 * D - 2 * H),
      acknowledgedAt: iso(-1 * D - 1 * H),
      acknowledgementDeadline: iso(-2 * H),
      estimatedCompletion: iso(6 * D),
      riskFlags: ['Property insecure — front door will not lock'],
      urgentReported: true,
      evidence: [
        { id: 'RR-2026-0484-e1', name: 'front-door-lock.jpg', type: 'image', sizeLabel: '1.4 MB', uploadedBy: 'resident' },
      ],
      timeline: [
        { id: 'RR-2026-0484-t1', timestamp: iso(-1 * D - 2 * H), title: 'Repair reported', actor: 'resident' },
        {
          id: 'RR-2026-0484-t2',
          timestamp: iso(-1 * D - 1 * H),
          title: 'Repair acknowledged',
          description: 'Acknowledged. Awaiting triage and contractor assignment.',
          actor: 'council',
        },
      ],
      notes: [],
    },

    // 7 — STANDARD · routine dripping tap · SUBMITTED (awaiting triage)
    {
      reference: 'RR-2026-0479',
      resident: {
        name: 'Tom Garrick',
        address: '17 Maple Street, Riverford, RV2 1NN',
        email: 't.garrick@example.com',
        phone: '07700 900479',
        vulnerable: false,
      },
      category: 'Plumbing',
      description: 'The bathroom cold tap drips constantly. Not urgent but it is wasting water and a bit annoying.',
      priority: 'Standard',
      status: 'Submitted',
      submittedAt: iso(-1 * D),
      acknowledgementDeadline: iso(4 * D),
      estimatedCompletion: iso(27 * D),
      riskFlags: [],
      urgentReported: false,
      evidence: [],
      timeline: [{ id: 'RR-2026-0479-t1', timestamp: iso(-1 * D), title: 'Repair reported', actor: 'resident' }],
      notes: [],
    },

    // 8 — COMPLETED · window · Standard · on time
    {
      reference: 'RR-2026-0455',
      resident: {
        name: 'Grace Okonkwo',
        address: '30 Rowan Way, Riverford, RV3 6TP',
        email: 'g.okonkwo@example.com',
        phone: '07700 900455',
        vulnerable: false,
      },
      category: 'Doors/windows',
      description: 'Cracked pane in the living room window letting in a draught.',
      priority: 'Standard',
      status: 'Completed',
      submittedAt: iso(-20 * D),
      acknowledgedAt: iso(-20 * D + 1 * D),
      acknowledgementDeadline: iso(-20 * D + 5 * D),
      estimatedCompletion: iso(8 * D),
      completedAt: iso(-8 * D),
      appointment: { date: iso(-9 * D), window: '12:00–16:00' },
      assignedTo: 'Riverford Direct Labour — Glazing',
      riskFlags: [],
      urgentReported: false,
      evidence: [
        { id: 'RR-2026-0455-e1', name: 'window-before.jpg', type: 'image', sizeLabel: '1.7 MB', uploadedBy: 'resident' },
        { id: 'RR-2026-0455-e2', name: 'window-after.jpg', type: 'image', sizeLabel: '1.5 MB', uploadedBy: 'officer' },
      ],
      timeline: [
        { id: 'RR-2026-0455-t1', timestamp: iso(-20 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0455-t2', timestamp: iso(-20 * D + 1 * D), title: 'Repair acknowledged', actor: 'council' },
        { id: 'RR-2026-0455-t3', timestamp: iso(-19 * D), title: 'Triaged as Standard', actor: 'council' },
        { id: 'RR-2026-0455-t4', timestamp: iso(-12 * D), title: 'Appointment booked', actor: 'council' },
        { id: 'RR-2026-0455-t5', timestamp: iso(-9 * D), title: 'Work in progress', actor: 'council' },
        {
          id: 'RR-2026-0455-t6',
          timestamp: iso(-8 * D),
          title: 'Repair completed',
          description: 'Pane replaced and draught-proofing renewed.',
          actor: 'council',
        },
      ],
      notes: [
        { id: 'RR-2026-0455-n1', timestamp: iso(-8 * D), author: 'James Coyle', text: 'Completed and signed off. Resident satisfied.' },
      ],
    },

    // 9 — COMPLETED · heating · Urgent · on time
    {
      reference: 'RR-2026-0461',
      resident: {
        name: 'Liam Foster',
        address: '12 Birch Court, Riverford, RV1 2RR',
        email: 'l.foster@example.com',
        phone: '07700 900461',
        vulnerable: false,
      },
      category: 'Heating',
      description: 'Radiators across the flat were cold and the heating was not coming on properly.',
      priority: 'Urgent',
      status: 'Completed',
      submittedAt: iso(-12 * D),
      acknowledgedAt: iso(-12 * D + 4 * H),
      acknowledgementDeadline: iso(-12 * D + 24 * H),
      estimatedCompletion: iso(-5 * D),
      completedAt: iso(-10 * D),
      appointment: { date: iso(-10 * D), window: '08:00–12:00' },
      assignedTo: 'Apex Heating Ltd',
      riskFlags: [],
      urgentReported: false,
      evidence: [
        { id: 'RR-2026-0461-e1', name: 'boiler-service.jpg', type: 'image', sizeLabel: '1.3 MB', uploadedBy: 'officer' },
      ],
      timeline: [
        { id: 'RR-2026-0461-t1', timestamp: iso(-12 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0461-t2', timestamp: iso(-12 * D + 4 * H), title: 'Repair acknowledged', actor: 'council' },
        { id: 'RR-2026-0461-t3', timestamp: iso(-12 * D + 6 * H), title: 'Triaged as Urgent', actor: 'council' },
        { id: 'RR-2026-0461-t4', timestamp: iso(-11 * D), title: 'Appointment booked', actor: 'council' },
        {
          id: 'RR-2026-0461-t5',
          timestamp: iso(-10 * D),
          title: 'Repair completed',
          description: 'New thermocouple fitted, boiler tested and certified.',
          actor: 'council',
        },
      ],
      notes: [],
    },

    // 10 — STANDARD · extractor fan · AWAITING INFORMATION
    {
      reference: 'RR-2026-0476',
      resident: {
        name: 'Nadia Hussain',
        address: '2 Elm Rise, Riverford, RV4 7GD',
        email: 'n.hussain@example.com',
        phone: '07700 900476',
        vulnerable: false,
      },
      category: 'Other',
      description: 'Kitchen extractor fan has stopped working and condensation is building up on the windows.',
      priority: 'Standard',
      status: 'Awaiting information',
      submittedAt: iso(-6 * D),
      acknowledgedAt: iso(-6 * D + 1 * D),
      acknowledgementDeadline: iso(-6 * D + 5 * D),
      estimatedCompletion: iso(22 * D),
      assignedTo: 'Priya Shah (Housing Officer)',
      riskFlags: [],
      urgentReported: false,
      evidence: [],
      timeline: [
        { id: 'RR-2026-0476-t1', timestamp: iso(-6 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0476-t2', timestamp: iso(-6 * D + 1 * D), title: 'Repair acknowledged', actor: 'council' },
        {
          id: 'RR-2026-0476-t3',
          timestamp: iso(-3 * D),
          title: 'More information requested',
          description: 'Asked the resident to confirm availability for an access appointment.',
          actor: 'council',
        },
      ],
      notes: [
        {
          id: 'RR-2026-0476-n1',
          timestamp: iso(-3 * D),
          author: 'Priya Shah',
          text: 'Awaiting resident response on access times before scheduling an electrician.',
        },
      ],
    },

    // 11 — COMPLETED · plumbing · Standard · LATE (drags on-time rate)
    {
      reference: 'RR-2026-0448',
      resident: {
        name: 'Peter Voss',
        address: '64 Ashfield Road, Riverford, RV5 1QA',
        email: 'p.voss@example.com',
        phone: '07700 900448',
        vulnerable: false,
      },
      category: 'Plumbing',
      description: 'Slow-draining bath and gurgling waste pipe.',
      priority: 'Standard',
      status: 'Completed',
      submittedAt: iso(-40 * D),
      acknowledgedAt: iso(-40 * D + 2 * D),
      acknowledgementDeadline: iso(-40 * D + 5 * D),
      estimatedCompletion: iso(-12 * D),
      completedAt: iso(-9 * D),
      appointment: { date: iso(-9 * D), window: '08:00–12:00' },
      assignedTo: 'Riverford Direct Labour — Plumbing',
      riskFlags: [],
      urgentReported: false,
      evidence: [],
      timeline: [
        { id: 'RR-2026-0448-t1', timestamp: iso(-40 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0448-t2', timestamp: iso(-40 * D + 2 * D), title: 'Repair acknowledged', actor: 'council' },
        { id: 'RR-2026-0448-t3', timestamp: iso(-37 * D), title: 'Triaged as Standard', actor: 'council' },
        {
          id: 'RR-2026-0448-t4',
          timestamp: iso(-9 * D),
          title: 'Repair completed',
          description: 'Waste pipe cleared and re-seated. Completed later than target due to contractor availability.',
          actor: 'council',
        },
      ],
      notes: [],
    },

    // 12 — COMPLETED · damp · Urgent · on time
    {
      reference: 'RR-2026-0468',
      resident: {
        name: 'Carol Nwankwo',
        address: '9 Juniper Walk, Riverford, RV2 5HH',
        email: 'c.nwankwo@example.com',
        phone: '07700 900468',
        vulnerable: false,
      },
      category: 'Damp and mould',
      description: 'Damp patch and mould in the bathroom following a roof leak that has since been fixed.',
      priority: 'Urgent',
      status: 'Completed',
      submittedAt: iso(-15 * D),
      acknowledgedAt: iso(-15 * D + 6 * H),
      acknowledgementDeadline: iso(-15 * D + 24 * H),
      estimatedCompletion: iso(-8 * D),
      completedAt: iso(-9 * D),
      appointment: { date: iso(-11 * D), window: '12:00–16:00' },
      assignedTo: 'Riverford Direct Labour — Plastering',
      riskFlags: [],
      urgentReported: false,
      evidence: [
        { id: 'RR-2026-0468-e1', name: 'bathroom-damp.jpg', type: 'image', sizeLabel: '2.0 MB', uploadedBy: 'resident' },
      ],
      timeline: [
        { id: 'RR-2026-0468-t1', timestamp: iso(-15 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0468-t2', timestamp: iso(-15 * D + 6 * H), title: 'Repair acknowledged', actor: 'council' },
        { id: 'RR-2026-0468-t3', timestamp: iso(-14 * D), title: 'Triaged as Urgent', actor: 'council' },
        { id: 'RR-2026-0468-t4', timestamp: iso(-11 * D), title: 'Appointment booked', actor: 'council' },
        {
          id: 'RR-2026-0468-t5',
          timestamp: iso(-9 * D),
          title: 'Repair completed',
          description: 'Mould treated, wall re-plastered and repainted.',
          actor: 'council',
        },
      ],
      notes: [],
    },

    // 13 — COMPLETED · electrical · Urgent · on time
    {
      reference: 'RR-2026-0470',
      resident: {
        name: 'Owen Pritchard',
        address: '21 Fir Tree Lane, Riverford, RV3 2DL',
        email: 'o.pritchard@example.com',
        phone: '07700 900470',
        vulnerable: false,
      },
      category: 'Electrical',
      description: 'Lights in the hallway and kitchen kept tripping the fuse box.',
      priority: 'Urgent',
      status: 'Completed',
      submittedAt: iso(-10 * D),
      acknowledgedAt: iso(-10 * D + 3 * H),
      acknowledgementDeadline: iso(-10 * D + 24 * H),
      estimatedCompletion: iso(-3 * D),
      completedAt: iso(-6 * D),
      appointment: { date: iso(-8 * D), window: '08:00–12:00' },
      assignedTo: 'Northside Electrical (NICEIC)',
      riskFlags: [],
      urgentReported: false,
      evidence: [],
      timeline: [
        { id: 'RR-2026-0470-t1', timestamp: iso(-10 * D), title: 'Repair reported', actor: 'resident' },
        { id: 'RR-2026-0470-t2', timestamp: iso(-10 * D + 3 * H), title: 'Repair acknowledged', actor: 'council' },
        { id: 'RR-2026-0470-t3', timestamp: iso(-10 * D + 6 * H), title: 'Triaged as Urgent', actor: 'council' },
        { id: 'RR-2026-0470-t4', timestamp: iso(-8 * D), title: 'Appointment booked', actor: 'council' },
        {
          id: 'RR-2026-0470-t5',
          timestamp: iso(-6 * D),
          title: 'Repair completed',
          description: 'Faulty circuit identified and rewired. Tested and certified.',
          actor: 'council',
        },
      ],
      notes: [],
    },
  ]

  return repairs
}
