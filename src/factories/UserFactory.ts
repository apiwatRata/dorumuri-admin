import { users } from '@/db/schema/rbac'
import { db } from '@/db'
import { eq } from 'drizzle-orm'

type User = {
    id: number;
    email: string;
    passwordHash?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface UserFactoryInterface {
    create(): void;
    getUserByEmail(email: string): Promise<User>;
}
 
export type { User };

export class UserFactory implements UserFactoryInterface {
    private db_pool = db;
    private model = users;

    public create() {
        return
    }

    public async getUserByEmail(email: string){
        const users = await this.db_pool.select().from(this.model).where(eq(this.model.email, email)).execute();
        return users[0] as User;
    }
}