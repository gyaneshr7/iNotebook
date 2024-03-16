const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");

//ROUTE1 : Get all the Notes using: GET '/api/notes/getuser'. Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  const notes = await Notes.find({ user: req.user.id });
  res.json(notes);
});

//ROUTE2 : Add a new note using: POST '/api/notes/addnote'. Login required
router.post(
  "/addnote",
  fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters.").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //If there are errors, return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = await Notes.create({
        user: req.user.id,
        title,
        description,
        tag,
      });

      res.json(note);
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal server error!");
    }
  }
);

//ROUTE3 : Update an existing note using: POST '/api/notes/updatenote'. Login required
router.put("/updateNote/:id", fetchUser, async (req, res) => {
  const { title, description, tag } = req.body;
  //Create a newNote object

  try {
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not found");
    }

    console.log(note);

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error!");
  }
});

//ROUTE4 : Delete an existing note using: DELETE '/api/notes/deleteNote'. Login required
router.delete("/deleteNote/:id", fetchUser, async (req, res) => {
  try {
    //Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      res.status(404).send("Not found");
    }

    //allow deleteion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note });
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error!");
  }
});

module.exports = router;
