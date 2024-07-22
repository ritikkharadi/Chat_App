async function deleteFromCloudinary(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('File deleted from Cloudinary:', result);
        return result;
    } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
        throw error; // Handle or propagate the error as needed
    }
}
