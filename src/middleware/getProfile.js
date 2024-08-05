const getProfile = async (req, res, next) => {
  const { Profile } = req.app.get('models');
  try {
    const profile = await Profile.findOne({
      where: { id: req.get('profile_id') || 0 },
    });
    if (!profile) return res.status(401).end();
    req.profile = profile;
    return next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' }).end();
  }
};

module.exports = { getProfile };
