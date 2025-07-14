const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Key is not defined. Please check your environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const file = req.file;
        const bucketName = 'freelancer';

        console.log('Attempting to upload file to Supabase:', file.originalname);
        console.log('File mimetype:', file.mimetype);
        console.log('File size:', file.size, 'bytes');

        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
        const filePath = `public/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return res.status(500).json({ message: `Failed to upload image: ${error.message}` });
        }

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        if (publicUrlData && publicUrlData.publicUrl) {
            return res.status(200).json({
                message: 'Image uploaded successfully!',
                imageUrl: publicUrlData.publicUrl
            });
        } else {
            console.error('Supabase getPublicUrl did not return a public URL.');
            return res.status(500).json({ message: 'Image uploaded but failed to retrieve public URL.' });
        }

    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: error.message || 'Internal server error during image upload.' });
    }
};

module.exports = {
    uploadImage
};