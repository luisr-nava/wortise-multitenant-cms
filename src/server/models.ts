import { ObjectId } from "mongodb";

export interface Organization {
  _id?: ObjectId;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationRole = "OWNER" | "ADMIN" | "EDITOR" | "MEMBER";

export interface Membership {
  _id?: ObjectId;
  userId: string;
  organizationId: ObjectId;
  role: OrganizationRole;
  createdAt: Date;
}

export interface Article {
  _id?: ObjectId;
  title: string;
  slug: string;
  text: string;
  coverImageUrl: string;
  authorId: string;
  authorName: string;
  organizationId: ObjectId; // STRICT: Now required for new articles
  status: "draft" | "published";
  publishedAt?: Date | null;
  views?: number;
  createdAt: Date;
  updatedAt: Date;
}

