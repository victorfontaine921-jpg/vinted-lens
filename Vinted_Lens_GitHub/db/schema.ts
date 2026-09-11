import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const searches = sqliteTable("searches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  query: text("query").notNull(),
  sourceUrl: text("source_url"),
  imageKey: text("image_key"),
  intent: text("intent").notNull().default("exact"),
  analysisJson: text("analysis_json").notNull().default("{}"),
  createdAt: integer("created_at").notNull(),
});

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  searchId: text("search_id").notNull(),
  query: text("query").notNull(),
  vintedUrl: text("vinted_url").notNull(),
  createdAt: integer("created_at").notNull(),
});
