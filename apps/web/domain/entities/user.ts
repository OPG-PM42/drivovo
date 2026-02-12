type Experience = 'beginner' | 'intermediate' | 'advanced';

export interface UserEntity {
    id: string;
    name: string;
    email: string;
    phone: string;
    drivingExperience: Experience;
    cameFrom: string;
    availability: {
        day: 'today' | 'tomorrow' | 'weekend';
        time: 'morning' | 'afternoon' | 'evening';
    };
    drinks?: 'coffee' | 'tea';
    createdAt: Date;
    updatedAt: Date;
}