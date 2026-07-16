const { getUserPublicProfile, updateOwnProfile } = require('../services/user.service');
const { success } = require('../utils/response');

const getPublicProfile = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const profile = await getUserPublicProfile(id);
    return success(res, profile, 200);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, bio, avatarUrl } = req.body;
    const user = await updateOwnProfile(req.user.id, { name, bio, avatarUrl });
    return success(res, user, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = { getPublicProfile, updateMe };
