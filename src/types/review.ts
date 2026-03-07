// TypeScript types mirroring review_model.dart

export interface ReviewModel {
    id: string;
    userId: string;
    userName: string;
    userImage?: string;
    reviewImage?: string;
    rating: number;
    comment: string;
    createdAt: Date;
}
