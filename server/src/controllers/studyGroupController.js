const StudyGroup = require('../models/StudyGroup');

exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const group = await StudyGroup.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id] // creator joins automatically
    });
    res.status(201).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query.$text = { $search: search };
    }
    // Don't populate all members to save bandwidth on raw feed list
    const groups = await StudyGroup.find(query).limit(50);
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('members', 'firstName lastName avatar')
      .populate('createdBy', 'firstName lastName avatar')
      .populate('messages.senderId', 'firstName lastName avatar');
      
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch group' });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const isMember = group.members.some(id => id.toString() === req.user._id.toString());
    if (!isMember) {
      group.members.push(req.user._id);
      await group.save();
    }
    
    res.status(200).json({ message: 'Joined successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to join group' });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();
    
    res.status(200).json({ message: 'Left successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to leave group' });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Validate if the user is part of the group
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must join the group to send messages' });
    }

    const newMessage = { senderId: req.user._id, text };
    group.messages.push(newMessage);
    await group.save();

    // In a real implementation we would emit this via Socket.io here utilizing app.get('io')
    const reqIo = req.app.get('io');
    if (reqIo) {
       reqIo.to(group._id.toString()).emit('new-group-message', {
         groupId: group._id,
         message: { ...newMessage, senderId: { _id: req.user._id, firstName: req.user.firstName, lastName: req.user.lastName } }
       });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to post message' });
  }
};
