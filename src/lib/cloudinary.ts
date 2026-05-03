import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    url: string;
    publicId: string;
}

/**
 * Upload a file buffer to Cloudinary
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    filename: string
): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `vendorguard/${folder}`,
                public_id: filename,
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                    });
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        );
        uploadStream.end(buffer);
    });
}

/**
 * Delete a file from Cloudinary by public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;
