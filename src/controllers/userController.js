import { User } from "../models/userModel.js";
import { ApiError } from "../utils.js/ApiError.js";
import { ApiResponse } from "../utils.js/apiResponse.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils.js/jwt.js";
// import { uploadOnCloudinary } from "../utils.js/cloudinary.js";


const registerUser = async (req, res) => {

    try {
        const { userName, Name, email, password, bio } = req.body;
        const profilePicture = req.file ? req.file.path : null

        if ([userName, email, , password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "Please fill all the fields")
        }


        const useExistsAlready = await User.findOne({ $or: [{ userName }, { email }] })
        if (useExistsAlready) {
            throw new ApiError(400, "User already exists")
        }
        // console.log(profilePicture);

        // const cloudinaryUpload = await uploadOnCloudinary(profilePicture);

        // if (!cloudinaryUpload) {
        //     // If the upload fails, handle the error accordingly
        //     return res.status(400).json({
        //         success: false,
        //         message: "Error uploading to Cloudinary or file not provided",
        //         data: null,
        //         error: "CloudinaryError",
        //     });
        // }



        const user = await User.create({
            userName,
            password,
            Name,
            email,
            profilePicture
        })

        //jwt token

        const token = generateToken(user)
        if (!token) {
            throw new ApiError(400, "Token not generated")
        }



        const createdUser = await User.findById(user._id).select("-password")

        if (!createdUser) {
            throw new ApiError(400, "User not created")

        }

        // const options = { httpOnly: true, secure: true }

        // return res
        //     .status(201)
        //     .cookie("token", token, options)
        //     .json(
        //         new ApiResponse(
        //             201,
        //             createdUser,
        //             "User Created Successfully",
        //         ))

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.status(200).json({
            success: true,
            message: "user registered successful",
            user: { id: user._id, username: user.userName, email: user.email }
        });


    } catch (error) {
        console.error("error in controller", error)
    }


}

const LoginUser = async (req, res) => {
    const { userName, password, email } = req.body;
    if ([userName, email, , password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    console.log(user);

    if (!user) {
        new ApiError(400, "cant find user with the given credencials")
    }

    const passwordVarified = await user.isPasswordCorrect(password)
    // const isPasswordValid = await user.isPasswordCorrect(password)
    if (!passwordVarified) {
        new ApiError(400, "password has some problem")
    }


    //authentication token
    const token = generateToken(user)
    if (!token) {
        throw new ApiError(400, "Token not generated")
    }




    const loggedInUser = await User.findById(user._id).select("-password")



    // return res
    //     .status(200)
    //     .cookie("token", token, { httpOnly: true, secure: true })
    //     .json(new ApiResponse(200, loggedInUser, "logged in"))

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: user._id, username: user.userName, email: user.email }
    });

}

const logoutUser = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.status(200).json({
        success: true,
        message: "Logout successful",
    });
}


export {
    registerUser,
    LoginUser,
    logoutUser
}