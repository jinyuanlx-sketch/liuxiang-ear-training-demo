export interface Student {
  id: string;
  userId: string;
  name: string;
  grade: string;
  city: string;
  targetSchools: string[];
  major: string;
  minor: string;
  examDirection: string;
  currentLevel: string;
  trainingStage: string;
  currentFocus: string;
  teacherNotes: string;
  sightLevel: number;
  earLevel: number;
  theoryLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  userId: string;
  name: string;
  title: string;
  bio: string;
  createdAt: string;
}
