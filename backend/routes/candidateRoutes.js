const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/users');
const { jwtAuthMiddleware } = require('../utils/jwt');

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

router.post('/', jwtAuthMiddleware, isAdmin, async (req, res) => {
    try {
        const newCandidate = new Candidate(req.body);
        await newCandidate.save();
        res.status(201).json(newCandidate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', jwtAuthMiddleware, async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:candidateId', jwtAuthMiddleware, isAdmin, async (req, res) => {
    try {
        const updatedCandidate = await Candidate.findByIdAndUpdate(
            req.params.candidateId,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedCandidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(updatedCandidate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:candidateId', jwtAuthMiddleware, isAdmin, async (req, res) => {
    try {
        const deletedCandidate = await Candidate.findByIdAndDelete(req.params.candidateId);
        if (!deletedCandidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.isVoted) {
            return res.status(400).json({ error: 'You have already voted' });
        }

        const candidate = await Candidate.findById(req.params.candidateId);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        candidate.votes.push({ user: user._id });
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();

        res.json({ message: 'Vote cast successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/vote/count', jwtAuthMiddleware, async (req, res) => {
    try {
        const results = await Candidate.aggregate([
            {
                $project: {
                    party: 1,
                    voteCount: 1
                }
            },
            {
                $sort: { voteCount: -1 }
            }
        ]);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;