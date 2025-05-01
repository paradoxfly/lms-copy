let fileTypeFromBuffer;

(async () => {
  const fileType = await import('file-type');
  fileTypeFromBuffer = fileType.fileTypeFromBuffer;
})();

exports.parseBook = async (book) => {
  try {
    const bookData = { ...book.dataValues };

    // Handle image parsing
    if (bookData.cover_image) {
      if (Buffer.isBuffer(bookData.cover_image)) {
        if (!fileTypeFromBuffer) {
          const fileType = await import('file-type');
          fileTypeFromBuffer = fileType.fileTypeFromBuffer;
        }
        const fileType = await fileTypeFromBuffer(bookData.cover_image);
        if (fileType) {
          const base64Image = bookData.cover_image.toString("base64");
          bookData.image = `data:${fileType.mime};base64,${base64Image}`;
        } else {
          bookData.image = '/images/default-book-cover.jpg';
        }
      } else if (typeof bookData.cover_image === 'string') {
        bookData.image = bookData.cover_image;
      }
    } else {
      bookData.image = '/images/default-book-cover.jpg';
    }

    // Clean up the response
    delete bookData.cover_image;
    
    return bookData;
  } catch (error) {
    console.error('Error parsing book:', error);
    return {
      ...book.dataValues,
      image: '/images/default-book-cover.jpg'
    };
  }
};
