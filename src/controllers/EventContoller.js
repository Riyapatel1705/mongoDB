import env from "dotenv";
import multer from "multer";
import path from "path";
import { Event } from "../db/models/Event.js";
import { Bookmark } from "../db/models/Bookmark.js";
import { Admin } from "../db/models/Admin.js";
import { User } from "../db/models/User.js";
import { Organization } from "../db/models/Organization.js";
import { Feedback } from "../db/models/Feedback.js";
import mongoose from 'mongoose';
import { checkEventExists, isValidDate, escapeLike } from "../utils/validation.js";

env.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage }).single("eventImage");

// Create event function
export const registerUserEvent = async (req, res) => {
  const data = req.body;

  const requiredFields = [
    "name", "category", "start_date", "end_date",
    "address", "contact_details", "organization_name", "price"
  ];

  // Validate required fields
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Please fill all the required fields: ${missingFields.join(", ")}` });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized user!" });
  }

  try {
    // Check if event with the same name exists
    const event = await Event.findOne({ where: { name: data.name } });
    if (event) {
      return res.status(400).json({ message: "Event with this name already exists!" });
    }

    const image_url = req.file ? `public/uploads/${req.file.filename}` : null;

    const newEvent = await Event.create({
      name: data.name,
      category: data.category,
      short_description: data.short_description,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      is_virtual: data.is_virtual,
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      contact_details: data.contact_details,
      organization_name: data.organization_name,
      price: data.price,
      image_url,
      created_by: userId,
    });

    return res.status(201).json({ message: "Event created successfully!", event: newEvent });
  } catch (err) {
    console.error("Event creation error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
};

// Update event function
export const updateEvent = async (req, res) => {
  const { id } = req.params; // ✅ Correctly access ID from route param

  if (!id) return res.status(400).json({ message: "No ID provided in URL" });

  try {
    const event = await Event.findById(id); // ✅ Prefer this over findOne({ _id: id })
    if (!event) return res.status(404).json({ message: "No such event exists!" });

    Object.assign(event, req.body); // ✅ Apply updates
    await event.save();             // ✅ Save changes to DB

    return res.status(200).json({ message: "Event updated successfully!", event });
  } catch (err) {
    console.error("Error updating event:", err);
    return res.status(500).json({ message: "Error updating event" });
  }
};



// Delete event
export const deleteEvent = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "No id provided" });

  try {
    const event = await Event.findOne({_id:id});
    if (!event) return res.status(404).json({ message: "No such event exists!" });

    await event.deleteOne;

    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error in deleting event" });
  }
};

// List events by filter
export const getAllEvents = async (req, res) => {
  try {
    const {
      name, category, start_date, end_date, is_virtual, city, state, organization_name, min_price, max_price,
      page = 1, limit = 8
    } = req.query;

    const filters = {};

    if (name) filters.name = {$regex:name.trim(),$options:"i" };
    if (category) filters.category = {$regex:category.trim(),$options:"i"};
    if (start_date && end_date) {
      filters.start_date = {$gte:new Date(start_date),$lte:new Date(end_date)};
    } else if (start_date) {
      filters.start_date = {$gte:new Date(start_date) };
    } else if (end_date) {
      filters.start_date = {$lte:new Date(end_date)};
    }
    if (typeof is_virtual !== "undefined") {
      filters.is_virtual = is_virtual.toLowerCase() === "true";
    }
    if (city) filters.city = {$regex:city.trim(),$options:"i"};
    if (state) filters.state = {$regex:state.trim(),$options:"i"};
    if (organization_name) filters.organization_name = {$regex:organization_name.trim(),$options:"i"};

    if (min_price || max_price) {
      filters.price = {};
      if(!isNaN(min_price)) filters.price.$gte=parseFloat(min_price);
      if(!isNaN(max_price)) filters.price.$lte=parseFloat(max_price);
    }

    const skip=(parseInt(page)-1)*parseInt(limit);
    const total = await Event.countDocuments(filters);
    
    const events = await Event.find(filters)
      .sort({ start_date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (events.length === 0) {
      return res.status(200).json({
        message: "No events found for the given filters.",
        filtersUsed: filters,
        data: [],
        pagination: null,
      });
    }

    return res.status(200).json({
      data: events,
      pagination: {
        total,
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Bookmark event
export const bookmarkEvent = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { event_id } = req.body;

    if (!user_id) return res.status(401).json({ message: "Unauthorized or missing user" });
    if (!event_id) return res.status(400).json({ message: "Valid Event ID is required" });

    // Check if the event exists
    const eventExists = await Event.findById(event_id);
    if (!eventExists) return res.status(404).json({ message: "Event does not exist" });

    // Check if it's already bookmarked
    const existing = await Bookmark.findOne({ user_id, event_id });
    if (existing) return res.status(200).json({ message: "Already bookmarked" });

    // Create new bookmark
    const bookmark = await Bookmark.create({ user_id, event_id });

    res.status(201).json({ message: "Bookmarked successfully", bookmark });
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Please Provide an event Id" });
  }
  try {
    const event = await Event.findOne({ where: { id } });
    if (!event) {
      return res.status(404).json({ message: "No such event exists" });
    }
    return res.status(200).json({ event });
  } catch (err) {
    console.error("Error in fetching events details:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 8, 1), 100);
    const skip = (page - 1) * limit;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // set time to 00:00:00

    // Get total count of upcoming events
    const total = await Event.countDocuments({
      start_date: { $gte: today },
    });

    // Get upcoming event data
    const events = await Event.find({ start_date: { $gte: today } })
      .sort({ start_date: 1 }) // ascending order
      .skip(skip)
      .limit(limit);

    if (events.length === 0) {
      return res.status(200).json({
        message: "No upcoming events found",
        events: [],
      });
    }

    return res.status(200).json({
      data: events,
      pagination: {
        total,
        currentPage: page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in getUpcomingEvents:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const addEventByOrganization = async (req, res) => {
  try {
    const data = req.body;

    // Required fields check (customize as needed)
    const requiredFields = [
      "name", "category", "start_date", "end_date",
      "address", "contact_details", "organizationId", "price"
    ];

    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ message: `Please fill all required fields: ${missingFields.join(", ")}` });
    }

    // Check organization exists
    const org = await Organization.findById(data.organizationId);
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check if event with same name exists for that org (optional)
    const existingEvent = await Event.findOne({ name: data.name, organizationId: data.organizationId });
    if (existingEvent) {
      return res.status(400).json({ message: "Event with this name already exists for this organization." });
    }

    // Create new event document
    const newEvent = new Event({
      name: data.name,
      category: data.category,
      short_description: data.short_description,
      start_date: new Date(data.start_date),
      end_date: new Date(data.end_date),
      is_virtual: data.is_virtual || false,
      address: data.address,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      contact_details: data.contact_details,
      organizationId: data.organizationId, // Reference to org
      price: data.price,
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
      created_by: req.user?.id,  // assuming authenticated user id available here
    });

    await newEvent.save();

    return res.status(201).json({ message: "Event created successfully", event: newEvent });

  } catch (error) {
    console.error("Error adding event by organization:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addFeedback = async (req, res) => {
  const { user_id, event_id, rating, comment } = req.body;
  const now=new Date();

  const requiredFields = ["user_id", "event_id", "rating"];
  const missingFields = requiredFields.filter(
    (field) =>
      req.body[field] === undefined ||
      req.body[field] === null ||
      req.body[field] === ""
  );

  if (missingFields.length > 0) {
    return res.status(400).send({
      message: `Please fill all the required fields: ${missingFields.join(", ")}`,
    });
  }

  try {
   const event = await Event.findOne({
  _id: new mongoose.Types.ObjectId(event_id),
  start_date: { $lt: new Date() }, // or $lte if you want <=
   });
    if (!event) {
      return res.status(200).json({ message: "No event found or hasn't started yet" });
    }

    const user = await User.findById( new mongoose.Types.ObjectId(user_id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const feedback = await Feedback.create({ 
      user_id,
      event_id,
      rating,
      comment,
    });

    res.status(200).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (err) {
    console.log("error in submitting feedback:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteBookmarkByUser = async (req, res) => {
  try {
    const { user_id } = req.query;

    // Check if the userId is provided
    if (!user_id) {
      return res.status(400).json({ message: "Please provide the userId" });
    }

    // Check if there are any bookmarks for the given userId
    const bookmarks = await Bookmark.findAll({
      where: { user_id: user_id }, // Find bookmarks associated with the user
    });

    if (!bookmarks || bookmarks.length === 0) {
      return res.status(200).json({ message: "No such user has marked any events" });
    }

    // Destroy all bookmarks for the user
    await Bookmark.destroy({
      where: { user_id: user_id }, // Delete all bookmarks for the given userId
    });

    return res.status(200).json({ message: "Bookmarks deleted successfully" });
  } catch (err) {
    console.log("Error in destroying user's bookmarked events:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const deleteBookmarkEvent = async (req, res) => {
  try {
    const { event_id, user_id } = req.query;

    if (!event_id || !user_id) {
      return res.status(400).json({ message: "Please provide both event_id and user_id" });
    }

    // Find the bookmark document
    const bookmark = await Bookmark.findOne({ event_id, user_id });

    if (!bookmark) {
      return res.status(200).json({ message: "No such user has bookmarked such event" });
    }

    // Delete the bookmark
    await bookmark.deleteOne();

    return res.status(200).json({ message: "Bookmarked event removed!" });
  } catch (err) {
    console.log("Error in removing bookmarked event:", err.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export const deleteFeedback = async (req, res) => {
  const { user_id, event_id } = req.query;

  if (!user_id || !event_id) {
    return res.status(400).json({ message: "userId and eventId both are required fields" });
  }

  try {
    // Find the feedback document for the user and event
    const feedback = await Feedback.findOne({ user_id, event_id });

    if (!feedback) {
      return res.status(200).json({ message: "User has not added any feedback on this event" });
    }

    // Delete the found feedback document
    await feedback.deleteOne();

    return res.status(200).json({ message: "Feedback has been removed successfully" });
  } catch (err) {
    console.log("error in deleting Feedback:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePastEvents = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "Admin ID is required" });
    }

    // Check if user is admin
    const admin = await Admin.findById(new mongoose.Types.ObjectId(id));
    if (!admin) {
      return res.status(403).json({ message: "You are not authorized to delete events" });
    }

    // Set today's date to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("Comparing dates with:", today.toISOString());

    // Find past events
    const pastEvents = await Event.find({ start_date: { $lt: today } });  // $lt for strictly less than today
    if (pastEvents.length === 0) {
      return res.status(404).json({ message: "No past events found" });
    }

    // Delete past events
    const deleteResult = await Event.deleteMany({ start_date: { $lt: today } });
    if (deleteResult.deletedCount === 0) {
      return res.status(500).json({ message: "Error in deleting events" });
    }

    return res.status(200).json({
      message: `${deleteResult.deletedCount} past event(s) have been deleted`,
    });

  } catch (error) {
    console.error("Error deleting past events:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getBookmarkedEvents = async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: "Please provide userId" });
    }

    // Find all bookmarks for the given user and populate the event data
    const bookmarks = await Bookmark.find({ user_id }).populate("event_id");

    if (bookmarks.length === 0) {
      return res.status(200).json({ message: "No bookmarked events found for this user." });
    }

    // Extract full event details from populated bookmarks
    const bookmarkedEvents = bookmarks.map(bookmark => bookmark.event_id);

    return res.status(200).json({ bookmarkedEvents });
  } catch (err) {
    console.error("Error in getting bookmarked events:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getEventsClosingSoon=async(req,res)=>{
  try{
  const now=new Date();
  const inThreeDays=new Date();
  inThreeDays.setDate(now.getDate()+3);

  const events=await Event.findAll({
    where:{
      start_date:{
        [Op.between]:[now,inThreeDays],
    },
  },
  order:[["start_date","ASC"]],
});
if(events.length===0){
  return res.status(200).json({message:"No upcoming events closing soon"});
}
return res.status(200).json({closingSoonEvents:events});
}catch(err){
  console.error("Error fetchung closing soon events:",err.message);
  return res.status(500).json({message:"Internal server error"});
}
};

export const getFeedbackOfEvent = async (req, res) => {
  const { event_id } = req.query;

  if (!event_id) {
    return res.status(400).json({ message: "No eventId provided" });
  }

  try {
    const eventFeedbacks = await Feedback.findAll({
      where: { event_id },
      include: [
        {
          model: User,
          attributes: ["first_name", "last_name"], // Only fetch name fields
        },
      ],
    });

    if (eventFeedbacks.length === 0) {
      return res.status(200).json({ message: "This event does not have any feedback" });
    }

    return res.status(200).json({ feedbacks: eventFeedbacks });
  } catch (err) {
    console.log("Error in fetching event's feedbacks:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFeedbackOfUser = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: "user_id is not provided" });
  }

  try {
    // Find all feedbacks where user_id matches
    const feedbacks = await Feedback.find({ user_id });

    if (feedbacks.length === 0) {
      return res.status(200).json({ message: "This user has not added any feedbacks" });
    }

    return res.status(200).json({ feedbacks });
  } catch (err) {
    console.log("error in fetching feedbacks:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getSuggestedEvents = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ message: "User ID required" });

    // Get all bookmarks of the user and populate the event data
    const bookmarks = await Bookmark.find({ user_id }).populate("event_id");

    if (!bookmarks.length) {
      return res.status(200).json({ message: "No bookmarks found" });
    }

    // Extract categories and bookmarked event IDs
    const categories = bookmarks.map(b => b.event_id.category);
    const bookmarkedEventIds = bookmarks.map(b => b.event_id._id);

    // Find suggested events based on categories, excluding already bookmarked ones
    const suggestedEvents = await Event.find({
      category: { $in: categories },
      _id: { $nin: bookmarkedEventIds },
      start_date: { $gte: new Date() }
    }).sort({ start_date: 1 });

    return res.status(200).json({ suggestedEvents });

  } catch (err) {
    console.log("Error in suggesting events", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
