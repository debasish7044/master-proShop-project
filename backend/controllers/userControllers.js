import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

// @decs Auth user & get token
// @route POST api/users/login
// @access Public

export const authUsers = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email and password')
  }
})

// @decs Register user
// @route POST api/users
// @access Public

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body
  const ExistUser = await User.findOne({ email })

  if (ExistUser) {
    res.status(400)
    throw new Error('User is already exist')
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(404)
    throw new Error('User is not found')
  }
})

// @decs  get Logged in user profile
// @route GET /api/users/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(401)
    throw new Error('user is not found')
  }
})

// @decs  get Logged in user profile
// @route GET /api/users/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(401)
    throw new Error('user is not found')
  }
})

// @decs  Get all users
// @route GET /api/users
// @access Private/Admin

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

// @decs  Delete a user
// @route delete /api/users/:id
// @access Private/Admin

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await user.remove()
    res.json({ message: 'User has been removed' })
  } else {
    res.status(404)
    throw new Error('User is not fund')
  }
})

// @decs  Get a user
// @route GET /api/users/:id
// @access Private/Admin

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User is not fund')
  }
})

// @decs Update User
// @access PUT api/users/:id
// @access Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.isAdmin = req.body.isAdmin

    const updatedUser = await user.save()
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(401)
    throw new Error('user is not found')
  }
})
