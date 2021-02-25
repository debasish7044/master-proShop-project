import mongoose from 'mongoose'
import colors from 'colors'

const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    })
    console.log(`MongoDB connected to ${con.connection.host}`.inverse)
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse)
    process.exit(1)
  }
}

export default connectDB
