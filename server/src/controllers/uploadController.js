const getBaseUrl = () => process.env.API_BASE_URL || 'http://localhost:5000';

const uploadImages = (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: 'No images uploaded' });
  }

  const urls = req.files.map((file) => `${getBaseUrl()}/uploads/${file.filename}`);
  res.status(200).json({ urls });
};

module.exports = { uploadImages };
