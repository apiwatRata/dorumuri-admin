import { users } from '@/db/schema/rbac'
import { db } from '@/db'

interface UserFactoryInterface {
    create(): void
}

export class UserFactory implements UserFactoryInterface {
    private db_pool = db;
    private model = users;

    public create() {
        return
    }
}