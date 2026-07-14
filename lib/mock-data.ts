import type { Assignment } from "@/types/assignment";
import type { EarTrainingQuestion, SightSingingQuestion } from "@/types/question-bank";
import type { PracticeRecord, Submission, TeacherFeedback } from "@/types/submission";
import type { TrainingResourceLink } from "@/types/training-resource";
import type { Student, Teacher } from "@/types/user";

export const teachers: Teacher[] = [
  {
    id: "teacher-chen",
    userId: "user-teacher-chen",
    name: "陈老师",
    title: "视唱练耳主课教师",
    bio: "长期负责音乐艺考小三门训练，关注音准、调性感与考场稳定性。",
    createdAt: "2026-06-01T08:00:00.000Z"
  }
];

export const students: Student[] = [
  {
    id: "student-lin",
    userId: "user-student-lin",
    name: "林若安",
    grade: "高二",
    city: "杭州",
    targetSchools: ["浙江音乐学院", "上海音乐学院"],
    major: "声乐",
    minor: "钢琴",
    examDirection: "统考 + 校考",
    currentLevel: "小三门基础中等，音准稳定性待加强",
    trainingStage: "暑期强化第一阶段",
    currentFocus: "三度内级进音准、弱起小节稳定进入、C 大调调性感",
    teacherNotes: "声音条件较好，听辨反应快，但视唱遇到跳进时容易提前抬高。",
    sightLevel: 3,
    earLevel: 3,
    theoryLevel: 1,
    createdAt: "2026-06-10T08:00:00.000Z",
    updatedAt: "2026-07-08T09:10:00.000Z"
  },
  {
    id: "student-zhou",
    userId: "user-student-zhou",
    name: "周予衡",
    grade: "高三",
    city: "宁波",
    targetSchools: ["中国音乐学院", "中央音乐学院"],
    major: "作曲",
    minor: "视唱练耳",
    examDirection: "校考",
    currentLevel: "练耳基础较强，视唱速度稳定性需强化",
    trainingStage: "考前冲刺",
    currentFocus: "变化音反应、七和弦听辨预备、二拍子节奏稳定",
    teacherNotes: "分析能力强，容易在演唱时过度思考导致断句。",
    sightLevel: 4,
    earLevel: 4,
    theoryLevel: 2,
    createdAt: "2026-05-22T08:00:00.000Z",
    updatedAt: "2026-07-07T12:20:00.000Z"
  }
];

export const sightSingingQuestions: SightSingingQuestion[] = [
  {
    id: "sight_teacher_001",
    title: "C 大调二度三度基础视唱 01",
    level: 1,
    keySignature: "C major",
    mode: "major",
    timeSignature: "2/4",
    tempo: 72,
    measuresCount: 4,
    clef: "treble",
    rangeLow: "C4",
    rangeHigh: "G4",
    scoreImageUrl: null,
    pdfUrl: null,
    musicxmlUrl: "/demo/sight-c-major-2-4.musicxml",
    midiUrl: null,
    targetPitchJson: ["C4", "D4", "E4", "D4", "C4", "E4", "D4", "C4"],
    targetRhythmJson: [
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter"
    ],
    rubricJson: {
      pitchAccuracyWeight: 0.7,
      stabilityWeight: 0.3
    },
    difficultyTags: ["level_1", "stepwise_motion", "third_leap", "tonic_ending"],
    trainingGoal: "训练 C 大调内二度级进与三度小跳的音准稳定",
    teacherStyleNotes: "句尾主音保持支撑，不要压低。",
    sourceType: "manual_create",
    reviewStatus: "approved",
    createdBy: "teacher-chen",
    createdAt: "2026-07-01T08:00:00.000Z",
    updatedAt: "2026-07-06T08:00:00.000Z"
  },
  {
    id: "sight_ai_draft_001",
    title: "G 大调级进基础视唱候选 01",
    level: 1,
    keySignature: "G major",
    mode: "major",
    timeSignature: "2/4",
    tempo: 76,
    measuresCount: 4,
    clef: "treble",
    rangeLow: "D4",
    rangeHigh: "A4",
    scoreImageUrl: null,
    pdfUrl: null,
    musicxmlUrl: null,
    midiUrl: null,
    targetPitchJson: ["G4", "A4", "B4", "A4", "G4", "E4", "F#4", "G4"],
    targetRhythmJson: [
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter",
      "quarter"
    ],
    rubricJson: {
      pitchAccuracyWeight: 0.7,
      stabilityWeight: 0.3
    },
    difficultyTags: ["level_1", "ai_candidate", "stepwise_motion"],
    trainingGoal: "训练 G 大调内级进与主音回归",
    teacherStyleNotes: "AI 生成候选题，需老师确认旋律自然度。",
    sourceType: "ai_generated",
    reviewStatus: "draft",
    createdBy: "teacher-chen",
    createdAt: "2026-07-04T08:00:00.000Z",
    updatedAt: "2026-07-04T08:00:00.000Z"
  },
  {
    id: "sight_ai_draft_002",
    title: "a 小调弱起视唱候选 01",
    level: 2,
    keySignature: "a minor",
    mode: "minor",
    timeSignature: "3/4",
    tempo: 66,
    measuresCount: 4,
    clef: "treble",
    rangeLow: "E4",
    rangeHigh: "C5",
    scoreImageUrl: null,
    pdfUrl: null,
    musicxmlUrl: null,
    midiUrl: null,
    targetPitchJson: ["E4", "A4", "B4", "C5", "B4", "A4", "G4", "A4"],
    targetRhythmJson: ["eighth", "quarter", "quarter", "quarter", "quarter", "quarter", "quarter", "half"],
    rubricJson: {
      pitchAccuracyWeight: 0.65,
      phraseWeight: 0.35
    },
    difficultyTags: ["level_2", "minor_mode", "weak_beat_entry", "ai_candidate"],
    trainingGoal: "训练小调调性感和弱起进入",
    teacherStyleNotes: "AI 生成候选题，弱起节奏需老师复核。",
    sourceType: "ai_generated",
    reviewStatus: "draft",
    createdBy: "teacher-chen",
    createdAt: "2026-07-04T09:00:00.000Z",
    updatedAt: "2026-07-04T09:00:00.000Z"
  }
];

export const earTrainingQuestions: EarTrainingQuestion[] = [
  {
    id: "ear_teacher_single_001",
    title: "固定音名单音 C4",
    level: 1,
    type: "single_note",
    midiUrl: null,
    audioUrl: null,
    stimulusJson: {
      notes: ["C4"],
      playback: "single"
    },
    answerKeyJson: {
      correctAnswer: "C"
    },
    choicesJson: ["C", "D", "E", "F", "G", "A", "B"],
    explanation: "C4 是中央 C，固定音名答案为 C。",
    difficultyTags: ["level_1", "fixed_note", "single_note"],
    sourceType: "manual_create",
    reviewStatus: "approved",
    createdBy: "teacher-chen",
    createdAt: "2026-07-01T09:00:00.000Z",
    updatedAt: "2026-07-05T09:00:00.000Z"
  },
  {
    id: "ear_teacher_interval_001",
    title: "大三度听辨 01",
    level: 1,
    type: "interval",
    midiUrl: null,
    audioUrl: null,
    stimulusJson: {
      notes: ["C4", "E4"],
      playback: "melodic_up"
    },
    answerKeyJson: {
      correctAnswer: "major_third",
      aliases: ["大三度"]
    },
    choicesJson: ["minor_second", "major_second", "minor_third", "major_third", "perfect_fourth"],
    explanation: "C 到 E 为大三度。",
    difficultyTags: ["level_1", "interval", "third"],
    sourceType: "manual_create",
    reviewStatus: "approved",
    createdBy: "teacher-chen",
    createdAt: "2026-07-01T09:20:00.000Z",
    updatedAt: "2026-07-05T09:20:00.000Z"
  },
  {
    id: "ear_ai_draft_001",
    title: "小三和弦听辨候选 01",
    level: 1,
    type: "chord",
    midiUrl: null,
    audioUrl: null,
    stimulusJson: {
      notes: ["A3", "C4", "E4"],
      playback: "blocked"
    },
    answerKeyJson: {
      correctAnswer: "minor_triad",
      aliases: ["小三和弦"]
    },
    choicesJson: ["major_triad", "minor_triad", "diminished_triad", "augmented_triad"],
    explanation: "A-C-E 构成小三和弦。",
    difficultyTags: ["level_1", "chord", "ai_candidate"],
    sourceType: "ai_generated",
    reviewStatus: "draft",
    createdBy: "teacher-chen",
    createdAt: "2026-07-04T10:00:00.000Z",
    updatedAt: "2026-07-04T10:00:00.000Z"
  }
];

export const assignments: Assignment[] = [
  {
    id: "sg-001",
    title: "C 大调级进与三度跳进",
    module: "sight_singing",
    type: "sight_singing_piece",
    difficulty: 2,
    teacherId: "teacher-chen",
    studentId: "student-lin",
    description: "控制每个三度跳进前的预听，保持句尾不下坠。",
    questionId: "sight_teacher_001",
    questionRefType: "sight_singing",
    targetData: {
      key: "C major",
      meter: "2/4",
      tempo: 72,
      difficultyLabel: "Level 1",
      trainingGoal: "训练 C 大调内二度级进与三度小跳的音准稳定",
      teacherInstruction: "句尾主音保持支撑，不要压低。",
      targetPitches: ["C4", "D4", "E4", "D4", "C4", "E4", "D4", "C4"],
      rhythmPattern: [
        "quarter",
        "quarter",
        "quarter",
        "quarter",
        "quarter",
        "quarter",
        "quarter",
        "quarter"
      ],
      scoreUrl: "/demo/sight-c-major-2-4.musicxml"
    },
    dueDate: "2026-07-10T14:00:00.000Z",
    createdAt: "2026-07-08T08:00:00.000Z"
  },
  {
    id: "sg-002",
    title: "a 小调短句与弱起进入",
    module: "sight_singing",
    type: "sight_singing_piece",
    difficulty: 3,
    teacherId: "teacher-chen",
    studentId: "student-lin",
    description: "注意弱起后的重音位置，避免第一拍进入偏高。",
    questionId: null,
    questionRefType: null,
    targetData: {
      key: "a minor",
      meter: "3/4",
      tempo: 66,
      difficultyLabel: "阶段巩固",
      trainingGoal: "小调调性感与弱起进入",
      teacherInstruction: "AI 候选题演示。正式布置前应先通过老师审核。",
      targetPitches: ["E4", "A4", "B4", "C5", "B4", "A4", "G4", "A4"],
      rhythmPattern: null,
      scoreUrl: null
    },
    dueDate: "2026-07-12T14:00:00.000Z",
    createdAt: "2026-07-08T08:30:00.000Z"
  },
  {
    id: "ear-single-001",
    title: "固定音名单音 C4",
    module: "ear_training",
    type: "single_note",
    difficulty: 1,
    teacherId: "teacher-chen",
    studentId: "student-lin",
    description: "通过题库母题播放一个单音，学生选择固定音名。",
    questionId: "ear_teacher_single_001",
    questionRefType: "ear_training",
    targetData: {
      questionCount: 1,
      answerMode: "fixed_note",
      allowedOptions: ["C", "D", "E", "F", "G", "A", "B"]
    },
    dueDate: "2026-07-10T14:00:00.000Z",
    createdAt: "2026-07-08T09:00:00.000Z"
  }
];

export const trainingResourceLinks: TrainingResourceLink[] = [
  {
    id: "resource-sight-correction-001",
    title: "三度跳进总唱低？先听这个位置",
    description: "适合本题第 2-4 小节练习后复盘。",
    platform: "douyin",
    url: "https://v.douyin.com/example-sight/",
    resourceType: "correction",
    module: "sight_singing",
    questionId: "sight_teacher_001",
    assignmentId: null,
    displayPosition: "result_page",
    sortOrder: 1,
    isActive: true,
    createdBy: "teacher-chen",
    createdAt: "2026-07-10T08:00:00.000Z",
    updatedAt: "2026-07-10T08:00:00.000Z"
  },
  {
    id: "resource-sight-correction-002",
    title: "三度跳进偏低的练后复盘",
    description: "同一训练点的小红书版本，适合录音分析后复盘。",
    platform: "xiaohongshu",
    url: "https://www.xiaohongshu.com/example-sight-correction",
    resourceType: "correction",
    module: "sight_singing",
    questionId: "sight_teacher_001",
    assignmentId: null,
    displayPosition: "result_page",
    sortOrder: 2,
    isActive: true,
    createdBy: "teacher-chen",
    createdAt: "2026-07-10T08:05:00.000Z",
    updatedAt: "2026-07-10T08:05:00.000Z"
  },
  {
    id: "resource-sight-demo-001",
    title: "主音定位对应训练",
    description: "练习前确认 C 大调主音位置，适合开始录音前观看。",
    platform: "xiaohongshu",
    url: "https://www.xiaohongshu.com/example-sight-demo",
    resourceType: "related_content",
    module: "sight_singing",
    questionId: "sight_teacher_001",
    assignmentId: null,
    displayPosition: "before_practice",
    sortOrder: 2,
    isActive: true,
    createdBy: "teacher-chen",
    createdAt: "2026-07-10T08:10:00.000Z",
    updatedAt: "2026-07-10T08:10:00.000Z"
  },
  {
    id: "resource-sight-related-002",
    title: "C 大调主音感专项讲解",
    description: "同一训练点的抖音版本，适合练前建立调性感。",
    platform: "douyin",
    url: "https://v.douyin.com/example-sight-related/",
    resourceType: "explanation",
    module: "sight_singing",
    questionId: "sight_teacher_001",
    assignmentId: null,
    displayPosition: "before_practice",
    sortOrder: 1,
    isActive: true,
    createdBy: "teacher-chen",
    createdAt: "2026-07-10T08:12:00.000Z",
    updatedAt: "2026-07-10T08:12:00.000Z"
  },
  {
    id: "resource-ear-explanation-001",
    title: "音程听辨：大三度和小三度的听感区别",
    description: "做完音程题后建议复习。",
    platform: "xiaohongshu",
    url: "https://www.xiaohongshu.com/example-ear-interval",
    resourceType: "explanation",
    module: "ear_training",
    questionId: "ear_teacher_interval_001",
    assignmentId: null,
    displayPosition: "after_practice",
    sortOrder: 1,
    isActive: true,
    createdBy: "teacher-chen",
    createdAt: "2026-07-10T08:20:00.000Z",
    updatedAt: "2026-07-10T08:20:00.000Z"
  },
  {
    id: "resource-ear-review-001",
    title: "固定音名练后复盘",
    description: "做完单音题后，用这个短视频确认固定音名记忆方式。",
    platform: "douyin",
    url: "https://v.douyin.com/example-ear-review/",
    resourceType: "review",
    module: "ear_training",
    questionId: "ear_teacher_single_001",
    assignmentId: null,
    displayPosition: "after_practice",
    sortOrder: 1,
    isActive: true,
    createdBy: "teacher-chen",
    createdAt: "2026-07-10T08:30:00.000Z",
    updatedAt: "2026-07-10T08:30:00.000Z"
  },
  {
    id: "resource-ear-review-002",
    title: "固定音名对应训练",
    description: "同一训练点的小红书版本，适合做完单音题后复习。",
    platform: "xiaohongshu",
    url: "https://www.xiaohongshu.com/example-ear-single-review",
    resourceType: "related_content",
    module: "ear_training",
    questionId: "ear_teacher_single_001",
    assignmentId: null,
    displayPosition: "after_practice",
    sortOrder: 2,
    isActive: true,
    createdBy: "teacher-chen",
    createdAt: "2026-07-10T08:35:00.000Z",
    updatedAt: "2026-07-10T08:35:00.000Z"
  }
];

export const practiceRecords: PracticeRecord[] = [
  {
    id: "practice-001",
    studentId: "student-lin",
    module: "ear_training",
    type: "single_note",
    totalQuestions: 10,
    correctCount: 8,
    accuracy: 80,
    detailJson: {
      weakOptions: ["F", "B"]
    },
    practicedAt: "2026-07-08T11:20:00.000Z"
  },
  {
    id: "practice-002",
    studentId: "student-lin",
    module: "ear_training",
    type: "interval",
    totalQuestions: 8,
    correctCount: 6,
    accuracy: 75,
    detailJson: {
      weakOptions: ["小六度", "大七度"]
    },
    practicedAt: "2026-07-08T11:35:00.000Z"
  }
];

export const submissions: Submission[] = [
  {
    id: "submission-001",
    assignmentId: "sg-001",
    studentId: "student-lin",
    submissionType: "audio",
    fileUrl: null,
    autoScore: null,
    status: "submitted",
    submittedAt: "2026-07-08T12:10:00.000Z",
    autoResultJson: {
      pitchAccuracy: 82,
      averageCentDeviation: 24,
      maxCentDeviation: 68,
      wrongNoteCount: 2,
      stabilityScore: 76,
      voiceType: "female",
      rawDetectedPitchTrack: [],
      scoringAdjustedPitchTrack: [],
      detectedPitchTrack: [],
      items: [
        {
          targetPitch: "C4",
          targetMidi: 60,
          detectedPitch: "C4",
          detectedMidi: 60,
          averageFrequency: 262,
          centDeviation: 5,
          status: "accurate",
          writtenTargetMidi: 60,
          expectedSoundingMidi: 60,
          rawDetectedMidi: 60.05,
          scoringAdjustedMidi: 60.05,
          voiceType: "female",
          noteRegisterStatus: "normal_register"
        },
        {
          targetPitch: "D4",
          targetMidi: 62,
          detectedPitch: "D4",
          detectedMidi: 62,
          averageFrequency: 292,
          centDeviation: -18,
          status: "accurate",
          writtenTargetMidi: 62,
          expectedSoundingMidi: 62,
          rawDetectedMidi: 61.82,
          scoringAdjustedMidi: 61.82,
          voiceType: "female",
          noteRegisterStatus: "normal_register"
        },
        {
          targetPitch: "E4",
          targetMidi: 64,
          detectedPitch: "E4",
          detectedMidi: 64,
          averageFrequency: 335,
          centDeviation: 42,
          status: "sharp",
          writtenTargetMidi: 64,
          expectedSoundingMidi: 64,
          rawDetectedMidi: 64.42,
          scoringAdjustedMidi: 64.42,
          voiceType: "female",
          noteRegisterStatus: "normal_register"
        }
      ]
    }
  }
];

export const feedbackItems: TeacherFeedback[] = [
  {
    id: "feedback-001",
    submissionId: "submission-001",
    teacherId: "teacher-chen",
    textFeedback: "整体调性感比上周稳定。第三个音进入偏高，句尾 C 有轻微下坠，建议先慢速唱音名再回到原速。",
    ratingJson: {
      pitch: 3,
      rhythm: 4,
      tonality: 3,
      tempo: 4,
      phrasing: 3
    },
    nextSteps: "明天继续 C 大调三度跳进，先 60 bpm，再回到 72 bpm。",
    createdAt: "2026-07-08T15:30:00.000Z"
  }
];

export function getAssignmentById(id: string) {
  return assignments.find((assignment) => assignment.id === id);
}

export function getStudentById(id: string) {
  return students.find((student) => student.id === id);
}

export function getSubmissionById(id: string) {
  return submissions.find((submission) => submission.id === id);
}
