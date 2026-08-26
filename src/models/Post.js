import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment user is required']
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const pollOptionSchema = new mongoose.Schema({
  optionId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
    maxlength: [200, 'Option text cannot exceed 200 characters']
  },
  votes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]
});

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    maxlength: [300, 'Poll question cannot exceed 300 characters']
  },
  options: {
    type: [pollOptionSchema],
    validate: [
      (opts) => opts.length >= 2 && opts.length <= 6,
      'Poll must have between 2 and 6 options'
    ]
  },
  expiresAt: {
    type: Date,
    default: null
  },
  totalVotes: {
    type: Number,
    default: 0
  }
});

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['heart', 'thumbs_up', 'laugh', 'surprised', 'sad'],
    required: true
  }
});

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author (user) is required']
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters']
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    postType: {
      type: String,
      enum: ['standard', 'poll'],
      default: 'standard'
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published'
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          thumbnailUrl: { type: String },
          fileId: { type: String }
        }
      ],
      validate: [
        (imgs) => imgs.length <= 4,
        'Maximum 4 images allowed per post'
      ],
      default: []
    },
    // Legacy single image fields preserved for backward compatibility
    imageUrl: {
      type: String
    },
    imageThumbnailUrl: {
      type: String
    },
    imageFileId: {
      type: String
    },
    poll: {
      type: pollSchema,
      default: null
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    reactions: [reactionSchema],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema]
  },
  {
    timestamps: true
  }
);

// Backward compatibility & multi-image synchronization pre-save hook
postSchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    this.imageUrl = this.images[0].url;
    this.imageThumbnailUrl = this.images[0].thumbnailUrl || this.images[0].url;
    this.imageFileId = this.images[0].fileId || '';
  } else if (this.imageUrl && (!this.images || this.images.length === 0)) {
    this.images = [
      {
        url: this.imageUrl,
        thumbnailUrl: this.imageThumbnailUrl || this.imageUrl,
        fileId: this.imageFileId || ''
      }
    ];
  }

  // Calculate total votes for poll if present
  if (this.poll?.options) {
    let votesCount = 0;
    this.poll.options.forEach((opt) => {
      votesCount += opt.votes ? opt.votes.length : 0;
    });
    this.poll.totalVotes = votesCount;
  }

  // Sync heart reactions with likes array for backward compatibility
  if (this.reactions && this.reactions.length > 0) {
    this.likes = this.reactions
      .filter(r => r.type === 'heart')
      .map(r => r.user);
  }

  next();
});

// Indexes for query performance
postSchema.index({ user: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ createdAt: -1, views: -1 });
postSchema.index({ postType: 1, status: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
