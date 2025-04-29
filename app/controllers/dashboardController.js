const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const { parseBook } = require('../utils/parseData');
const { Op } = require('sequelize');

// Render dashboard page
exports.getDashboardPage = async (req, res) => {
  // Default values for the view
  const defaultData = {
    title: 'Dashboard',
    user: req.session.user || null,
    stats: {
      recentlyBorrowed: 0,
      currentlyReading: 0,
      pendingReturns: 0
    },
    newReads: [],
    pickOfTheWeek: []
  };

  try {
    // Check if user is authenticated
    if (!req.session.user || !req.session.user.user_id) {
      return res.redirect('/auth/login');
    }

    const userId = req.session.user.user_id;
    const currentDate = new Date();

    // Get initial data for rendering
    const [recentlyBorrowed, currentlyReading, pendingReturns] = await Promise.all([
      Transaction.count({
        where: {
          user_id: userId,
          transaction_type: 'rental',
          transaction_date: {
            [Op.gte]: new Date(currentDate - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }).catch(() => 0),
      Transaction.count({
        where: {
          user_id: userId,
          transaction_type: 'rental',
          rental_expiry: {
            [Op.gt]: currentDate
          }
        }
      }).catch(() => 0),
      Transaction.count({
        where: {
          user_id: userId,
          transaction_type: 'rental',
          rental_expiry: {
            [Op.lte]: currentDate
          }
        }
      }).catch(() => 0)
    ]);

    // Get new reads
    const newBooks = await Book.findAll({
      order: [['created_at', 'DESC']],
      limit: 3
    }).catch(() => []);

    const newReads = await Promise.all(
      newBooks.map(async (book) => {
        try {
          const parsedBook = await parseBook(book);
          return {
            ...parsedBook,
            description: parsedBook.description.substring(0, 100) + '...'
          };
        } catch (error) {
          console.error('Error parsing book:', error);
          return null;
        }
      })
    ).then(books => books.filter(book => book !== null));

    // Get pick of the week
    const pickOfTheWeek = await Book.findAll({
      order: [['rating', 'DESC']],
      limit: 6
    }).catch(() => []);

    const parsedPicks = await Promise.all(
      pickOfTheWeek.map(async (book) => {
        try {
          return await parseBook(book);
        } catch (error) {
          console.error('Error parsing book:', error);
          return null;
        }
      })
    ).then(books => books.filter(book => book !== null));

    // Merge with default data
    const viewData = {
      ...defaultData,
      stats: {
        recentlyBorrowed: recentlyBorrowed || 0,
        currentlyReading: currentlyReading || 0,
        pendingReturns: pendingReturns || 0
      },
      newReads,
      pickOfTheWeek: parsedPicks
    };

    res.render('userDashboard', viewData);
  } catch (error) {
    console.error('Error rendering dashboard:', error);
    // Render the page with default data in case of error
    res.render('userDashboard', defaultData);
  }
};

// Get dashboard statistics and data for updates
exports.getDashboardStats = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user || !req.session.user.user_id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.session.user.user_id;
    const currentDate = new Date();

    // Get counts
    const [recentlyBorrowed, currentlyReading, pendingReturns] = await Promise.all([
      Transaction.count({
        where: {
          user_id: userId,
          transaction_type: 'rental',
          transaction_date: {
            [Op.gte]: new Date(currentDate - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }).catch(() => 0),
      Transaction.count({
        where: {
          user_id: userId,
          transaction_type: 'rental',
          rental_expiry: {
            [Op.gt]: currentDate
          }
        }
      }).catch(() => 0),
      Transaction.count({
        where: {
          user_id: userId,
          transaction_type: 'rental',
          rental_expiry: {
            [Op.lte]: currentDate
          }
        }
      }).catch(() => 0)
    ]);

    // Get new reads
    const newBooks = await Book.findAll({
      order: [['created_at', 'DESC']],
      limit: 3
    }).catch(() => []);

    const newReads = await Promise.all(
      newBooks.map(async (book) => {
        try {
          const parsedBook = await parseBook(book);
          return {
            ...parsedBook,
            description: parsedBook.description.substring(0, 100) + '...'
          };
        } catch (error) {
          console.error('Error parsing book:', error);
          return null;
        }
      })
    ).then(books => books.filter(book => book !== null));

    // Get pick of the week
    const pickOfTheWeek = await Book.findAll({
      order: [['rating', 'DESC']],
      limit: 6
    }).catch(() => []);

    const parsedPicks = await Promise.all(
      pickOfTheWeek.map(async (book) => {
        try {
          return await parseBook(book);
        } catch (error) {
          console.error('Error parsing book:', error);
          return null;
        }
      })
    ).then(books => books.filter(book => book !== null));

    res.json({
      recentlyBorrowed: recentlyBorrowed || 0,
      currentlyReading: currentlyReading || 0,
      pendingReturns: pendingReturns || 0,
      newReads,
      pickOfTheWeek: parsedPicks
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      recentlyBorrowed: 0,
      currentlyReading: 0,
      pendingReturns: 0,
      newReads: [],
      pickOfTheWeek: []
    });
  }
}; 