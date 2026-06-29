require('dotenv').config();
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const mongoose = require('mongoose');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit';
// Connect silently to not corrupt stdout (which is used by stdio transport!)
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(err => {
    console.error('MCP MongoDB connection error:', err);
  });

// Load Models
const User = require('../backend/models/User');
const Technician = require('../backend/models/Technician');
const RepairRequest = require('../backend/models/RepairRequest');
const Estimate = require('../backend/models/Estimate');
const Appointment = require('../backend/models/Appointment');
const Review = require('../backend/models/Review');
const Notification = require('../backend/models/Notification');

// Initialize MCP Server
const server = new Server({
  name: "fixit-mcp-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Helper: Calculate distance between two coordinates in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1)); // Distance in km
}

// 1. List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_technicians",
        description: "Search for available technicians based on skill category and city.",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Skill category (e.g. Electricians, Plumbers, AC Technicians)" },
            city: { type: "string", description: "City in Cameroon (e.g. Douala, Yaoundé)" }
          },
          required: ["category", "city"]
        }
      },
      {
        name: "get_technician_profile",
        description: "Retrieve full details and ratings of a technician by their ID.",
        inputSchema: {
          type: "object",
          properties: {
            technicianId: { type: "string", description: "Technician's unique ID" }
          },
          required: ["technicianId"]
        }
      },
      {
        name: "get_category_rates",
        description: "Retrieve baseline labor and parts pricing for a given repair category.",
        inputSchema: {
          type: "object",
          properties: {
            category: { type: "string", description: "Repair category (e.g. Plumbers, Electricians)" }
          },
          required: ["category"]
        }
      },
      {
        name: "create_estimate",
        description: "Generate a new price quotation for a repair request.",
        inputSchema: {
          type: "object",
          properties: {
            repairRequestId: { type: "string", description: "Repair request ID" },
            technicianId: { type: "string", description: "Matched technician ID" },
            labor: { type: "number", description: "Labor cost in FCFA" },
            parts: { type: "number", description: "Parts cost in FCFA" },
            travel: { type: "number", description: "Travel fee in FCFA" },
            totalRange: { type: "string", description: "String indicating total range (e.g. '15000 FCFA - 18000 FCFA')" }
          },
          required: ["repairRequestId", "technicianId", "labor", "parts", "travel", "totalRange"]
        }
      },
      {
        name: "calculate_proximity",
        description: "Calculate proximity distance (in km) between client location city and technician.",
        inputSchema: {
          type: "object",
          properties: {
            cityName: { type: "string", description: "Client's city name" },
            technicianId: { type: "string", description: "Technician's ID" }
          },
          required: ["cityName", "technicianId"]
        }
      },
      {
        name: "create_appointment",
        description: "Schedule a confirmed appointment between the customer and technician.",
        inputSchema: {
          type: "object",
          properties: {
            repairRequestId: { type: "string", description: "Repair request ID" },
            technicianId: { type: "string", description: "Technician's ID" },
            date: { type: "string", description: "ISO date string for appointment" },
            location: { type: "string", description: "Address/location" }
          },
          required: ["repairRequestId", "technicianId", "date", "location"]
        }
      },
      {
        name: "send_notification",
        description: "Send an in-app notification to a user regarding booking status.",
        inputSchema: {
          type: "object",
          properties: {
            userId: { type: "string", description: "Recipient user ID" },
            message: { type: "string", description: "Alert message text" },
            type: { type: "string", enum: ["info", "alert", "reminder"], description: "Notification type" }
          },
          required: ["userId", "message", "type"]
        }
      }
    ]
  };
});

// 2. Call tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_technicians": {
        const { category, city } = args;
        const matchingUsers = await User.find({ city, role: "technician" }).select('_id');
        const userIds = matchingUsers.map(u => u._id);
        const techs = await Technician.find({ category, user: { $in: userIds } })
          .populate('user', 'name city phone');
        return {
          content: [{ type: "text", text: JSON.stringify(techs) }]
        };
      }

      case "get_technician_profile": {
        const { technicianId } = args;
        const tech = await Technician.findById(technicianId).populate('user', 'name city phone');
        if (!tech) {
          return { content: [{ type: "text", text: "Technician profile not found." }], isError: true };
        }
        const reviews = await Review.find({ technician: technicianId }).populate('customer', 'name').limit(5);
        return {
          content: [{ type: "text", text: JSON.stringify({ profile: tech, reviews }) }]
        };
      }

      case "get_category_rates": {
        const { category } = args;
        // Mock baseline pricing rules for Cameroon market (FCFA)
        const baseRates = {
          'Electricians': { labor: 8000, parts: 7000, travel: 3000 },
          'Plumbers': { labor: 6000, parts: 9000, travel: 2500 },
          'Carpenters': { labor: 10000, parts: 15000, travel: 4000 },
          'Welders': { labor: 12000, parts: 18000, travel: 5000 },
          'Solar Technicians': { labor: 15000, parts: 45000, travel: 6000 },
          'AC Technicians': { labor: 10000, parts: 15000, travel: 4000 },
          'Refrigeration Technicians': { labor: 12000, parts: 20000, travel: 4500 },
          'Painters': { labor: 15000, parts: 25000, travel: 3500 },
          'Masons': { labor: 12000, parts: 30000, travel: 4000 },
          'Appliance Repair Specialists': { labor: 7000, parts: 12000, travel: 3000 }
        };
        const rates = baseRates[category] || { labor: 5000, parts: 5000, travel: 2000 };
        return {
          content: [{ type: "text", text: JSON.stringify(rates) }]
        };
      }

      case "create_estimate": {
        const { repairRequestId, technicianId, labor, parts, travel, totalRange } = args;
        const estimate = new Estimate({
          repairRequest: repairRequestId,
          technician: technicianId,
          labor,
          parts,
          travel,
          totalRange,
          status: 'pending'
        });
        await estimate.save();

        // Update repair request status
        await RepairRequest.findByIdAndUpdate(repairRequestId, { status: 'estimated', matchedTechnician: technicianId });

        return {
          content: [{ type: "text", text: JSON.stringify(estimate) }]
        };
      }

      case "calculate_proximity": {
        const { cityName, technicianId } = args;
        const tech = await Technician.findById(technicianId).populate('user');
        if (!tech) {
          return { content: [{ type: "text", text: "Technician not found" }], isError: true };
        }

        // Yaounde coords default if cityName not matched
        const cityCenters = {
          "Douala": { lat: 4.0511, lng: 9.7679 },
          "Yaoundé": { lat: 3.8480, lng: 11.5021 },
          "Bafoussam": { lat: 5.4778, lng: 10.4178 },
          "Kribi": { lat: 2.9506, lng: 9.9075 },
          "Limbe": { lat: 4.0135, lng: 9.2205 },
          "Garoua": { lat: 9.3004, lng: 13.3934 },
          "Bamenda": { lat: 5.9631, lng: 10.1591 },
          "Bertoua": { lat: 4.5772, lng: 13.6846 }
        };
        const base = cityCenters[cityName] || cityCenters["Douala"];
        const dist = haversineDistance(base.lat, base.lng, tech.latitude, tech.longitude);

        return {
          content: [{ type: "text", text: JSON.stringify({ distanceKm: dist }) }]
        };
      }

      case "create_appointment": {
        const { repairRequestId, technicianId, date, location } = args;
        const appointment = new Appointment({
          repairRequest: repairRequestId,
          technician: technicianId,
          date: new Date(date),
          location,
          status: 'confirmed'
        });
        await appointment.save();

        // Update request status
        await RepairRequest.findByIdAndUpdate(repairRequestId, { status: 'scheduled' });

        return {
          content: [{ type: "text", text: JSON.stringify(appointment) }]
        };
      }

      case "send_notification": {
        const { userId, message, type } = args;
        const notification = new Notification({
          user: userId,
          message,
          type,
          read: false
        });
        await notification.save();
        return {
          content: [{ type: "text", text: JSON.stringify(notification) }]
        };
      }

      default:
        return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error executing tool ${name}: ${error.message}` }],
      isError: true
    };
  }
});

// Run stdio transport
const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  console.error("MCP Server successfully listening on stdio.");
}).catch((error) => {
  console.error("MCP Server failed to start:", error);
});
