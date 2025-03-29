import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: 'dycmay6eq',
    api_key: '266674131275262',
    api_secret: 'Gc5t9Dq-e-_9YHYQylfK7GeaNsI'
    // cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    // api_key:process.env.CLOUDINARY_API_KEY,
    // api_secret:process.env.CLOUDINARY_API_SECRET
});

console.log("cloudinary config", process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto",
            }
        )
        // console.log("file has been succesfully uploaded to cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);

        // Safely delete the local file if upload fails
        try {
            fs.unlinkSync(localFilePath);

        } catch (unlinkError) {
            console.error("Failed to delete local file:", unlinkError);
        }

        return null;
    }
}

export { uploadOnCloudinary }

