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
        field: "created",
        verb: "anytime",
        value?: unknown,
    },
    sortOrder: {
        field: "Number",
        direction: "Ascending" | "Descending"
    }
    availability: "MySelf" | "All agents"
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
        verb: "anytime",
    },
    sortOrder: {
        field: "Number",
        direction: "Ascending",
    },
    availability: "MySelf",
});