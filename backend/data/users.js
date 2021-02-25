import bcrypt from 'bcryptjs'

const users = [
  {
    name: 'Admin User',
    email: 'debasish7044200115@gmail.com',
    isAdmin: true,
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Raj Das',
    email: 'rajdas12345@gmail.com',
    isAdmin: false,
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Ram Das',
    email: 'ram12345@gmail.com',
    isAdmin: false,
    password: bcrypt.hashSync('123456', 10),
  },
]

export default users
