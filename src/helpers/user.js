function getUserMainFields(user) {
    const { fullName, email, _id } = user;
    return {
        _id,
        email,
        fullName,
    };
}

module.exports = {
    getUserMainFields,
};
