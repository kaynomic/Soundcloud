const express = require('express');
const router = express.Router();
const { requireAuth, restoreUser, setTokenCookie } = require("../utils/auth.js");

const { User, Album, Song, Comment } = require('../db/models');

/* ---------------------- GET ----------------------- */

// Get All Songs
router.get('/', async (req, res) => {
    const songs = await Song.findAll({
        attributes: ["id", "userId", "albumId", "title", "description", "createdAt", "updatedAt", "previewImage"]
    })
    res.json(songs);
})


// Get details of a Song from an id
router.get('/:songId', async (req, res) => {
    const { songId } = req.params;

    const song = await Song.findByPk(songId, {
        include: [
            {
                model: User,
                as: "Artist",
                attributes: ["id", "username", "previewImage"]
            },
            {
                model: Album,
                attributes: ["id", "title", "previewImage"]
            }
        ]
    });

    if (!song) {
        const err = new Error("Song not found");
        err.status = 404;
        throw err;
    }

    res.json(song);
})


// Get all Comments by Song id
router.get('/:songId/comments', async (req, res) => {
    const { user } = req;
    const { songId } = req.params;

    const song = await Song.findByPk(songId, {
        include: [
            {
                model: Comment,
                include: [
                    {
                        model: User,
                        attributes: [
                            "id", "username"
                        ]
                    }
                ]
            }
        ]
    });

    if (song) {

        res.json({Comments: song.Comments});

    } else {
        const err = new Error("Song not found");
        err.status = 404;
        throw err;
    }
})


/* ---------------------- POST ----------------------- */

// Create a Comment for a Song based on the Song's id
router.post('/:songId/comments', requireAuth, async (req, res) => {
    const { user } = req;
    const { songId } = req.params;
    const { body } = req.body;

    const song = await Song.findByPk(songId);

    if (song) {
        const comment = await Comment.create({
            body,
            songId,
            userId: user.id
        })

        res.json(comment);

    } else {
        const err = new Error("Song not found");
        err.status = 404;
        throw err;
    }
})

/* ---------------------- PUT ----------------------- */

// Edit a Song
router.put('/:songId', requireAuth, async (req, res) => {
    const { user } = req;
    const { songId } = req.params;
    const { title, description, url, previewImage } = req.body;

    const song = await Song.findByPk(songId);

    if (song) {
        await song.update({
            title,
            description,
            url,
            previewImage
        })
    } else {
        const err = new Error("Song not found");
        err.status = 404;
        throw err;
    }
    res.json(song);
})

/* ---------------------- DELETE ----------------------- */









module.exports = router;
