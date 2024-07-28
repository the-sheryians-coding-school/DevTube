const mongoose = require("mongoose")
const { Schema } = mongoose

const SubscriptionSchema = new Schema({
    subscriber: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    channel: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    mode: { type: String, enum: ["silent", "notification"], required: true }
})

const Subscription = mongoose.model("Subscription", SubscriptionSchema)

module.exports = Subscription
