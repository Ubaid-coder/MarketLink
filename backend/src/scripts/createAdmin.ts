import bcrypt from "bcryptjs";


const hashedPassword = await bcrypt.hash(
    "ali123",
    12
);
console.log(hashedPassword)