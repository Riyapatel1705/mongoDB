import express from "express";
import upload from "../middleware/upload.js";
import { Authorization } from "../middleware/Auth.js";

import {
  deleteEvent,
  getAllEvents,
  registerUserEvent,
  updateEvent,
  getUpcomingEvents,
  bookmarkEvent,
  deleteBookmarkByUser,
  deleteBookmarkEvent,
  getBookmarkedEvents,
  deletePastEvents,
  getEventsClosingSoon,
  getSuggestedEvents,
  addFeedback,
  getFeedbackOfUser,
  getFeedbackOfEvent,
  deleteFeedback,
  getEventById,
  addEventByOrganization
} from "../controllers/EventContoller.js";

const EventRouter = express.Router();

// Event routes
EventRouter.get("/api/events", getAllEvents);
EventRouter.get("/api/events-id", getEventById);
EventRouter.get("/api/events/upcoming", getUpcomingEvents);
EventRouter.get("/api/events/closing-soon", getEventsClosingSoon);
EventRouter.get("/api/events/suggestions", getSuggestedEvents);
EventRouter.delete("/api/events/past", deletePastEvents);
EventRouter.post("/api/events/register", Authorization, upload.single("file"), registerUserEvent);
EventRouter.put("/api/events/:id", Authorization, updateEvent);     // access as ?id=123
EventRouter.delete("/api/events/:id", Authorization, deleteEvent); // access as ?id=123
EventRouter.post("/api/events/organization", addEventByOrganization);

// Bookmark routes
EventRouter.post("/api/bookmarks", Authorization, bookmarkEvent);
EventRouter.get("/api/bookmarks", Authorization, getBookmarkedEvents);
EventRouter.delete("/api/bookmarks/user", Authorization, deleteBookmarkByUser);
EventRouter.delete("/api/bookmarks/event", Authorization, deleteBookmarkEvent);

// Feedback routes
EventRouter.post("/api/feedbacks", Authorization, addFeedback);
EventRouter.get("/api/feedbacks/user", Authorization, getFeedbackOfUser);       
EventRouter.get("/api/feedbacks/event", getFeedbackOfEvent);                   
EventRouter.delete("/api/feedbacks", Authorization, deleteFeedback);        

export { EventRouter };