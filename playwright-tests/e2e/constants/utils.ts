import { faker } from "@faker-js/faker";
import { count } from "console";

export interface TicketInfo {
    subject: string;
    customerEmail: string;
    desc: string;
    status?: "New" | "Open" | "Waiting on customer" | "On hold" | "Closed" | "Spam";
    priority?: "Low" | "Medium" | "High" | "Urgent";
    category?: "None" | "Questions" | "Incident" | "Problem" | "Feature request" | "Refund";
}
export interface Options {
    visibilityTimeout?: number;
    textAssertionTimeout?: number;
    retryTimeout?: number;
}

export interface User {
    firstName: string;
    lastName: string;
    otp: number;
    domain: string;
    currentUserName: string;
    businessName: string;
    subdomainName: string;
    email: string;
    isLoggedIn: boolean;
    baseUrl: string;
}

export interface ViewInfo {
    name: string;
    desc: string;
    active?: boolean;
    condition: {
        field: "created" | "channel" | "customer email" | "subject" | "description" | "latest comment" | "any comment"
        | "subject or description" | "status" | "category" | "priority" | "company" | "assigned agent" | "assigned group"
        | "received for email" | "tags" | "submitter role" | "hours since created" | "hourse since updated by agent or customer"
        | "hours since updated by customer" | "hourse since updated by agent" | "hours since first assigned" | "hourse since last assigned"
        | "hours since new" | "hours since open" | "hours since on hold" | "hours since waiting on customer" | "agent out of office" | "feedback" | "",

        verb: "Any time" | "During" | "Not during" | "Is" | "Is not" | "Contains" | "Does not contain" | "Starts with" | "Ends with"
        | "Contains any of" | "Contains none of" | "Contains all of" | "Less than" | "Greater than" | ""
        ,
        value?: "UI" | "Email" | "Chat" | "API" | "Web form" | "New" | "Open" | "Waiting on customer" | "On hold" | "Closed" | "Spam" | "Trash"
        | "None" | "Questions" | "Incident" | "Problem" | "Feature request" | "Refund" | "Low" | "Medium" | "Urgent" | "High" | "Unassigned" | "support.deepu@neetodeskemail.net"
        | "feature-request" | "sales" | "feedback" | "refund" | "Admin" | "Agent" | "Yes" | "No" | "Any" | "Great" | "Okay" | "Not Good",
    },
    sortOrder: {
        field: "Number" | "Created Date" | "Last Modified" | "Priority" | "Status" | "",
        direction: "Ascending" | "Descending" | "",
    }
    availability: "MySelf" | "All agents"
}

export interface CannedResponseInfo {
    name: string,
    desc: string,
    active?: boolean;
    availability?: "self" | "All agents" | "Agents in group",
    note: string,
}

export const generateTicketInfo = ({
    user,
    category,
    priority,
    status
}: {
    user: any;
    category?: TicketInfo['category'];
    priority?: TicketInfo['priority'];
    status?: TicketInfo['status'];
}): TicketInfo => ({
    subject: faker.word.words({ count: 2 }),
    customerEmail: faker.internet.email({ firstName: user.firstName }),
    desc: faker.word.words({ count: 10 }),
    category: category || 'None',
    priority: priority || 'Medium',
    status: status || 'New',
});
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


export const generateViewInfo = (): ViewInfo => ({
    name: faker.word.words({ count: 1 }),
    desc: faker.word.words({ count: 10 }),
    active: true,
    condition: {
        field: "created",
        verb: "Any time",
    },
    sortOrder: {
        field: "Number",
        direction: "Ascending",
    },
    availability: "MySelf",
});

export const generateCannedResponse = (): CannedResponseInfo => ({
    name: faker.word.words({ count: 1 }),
    desc: faker.word.words({ count: 10 }),
    active: true,
    availability: "self",
    note: faker.word.words({ count: 10 }),
})