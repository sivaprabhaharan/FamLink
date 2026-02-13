export interface Child {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    allergies?: string[];
    notes?: string;
}

export interface IChildrenService {
    getChildren(): Promise<Child[]>;
    getChild(id: string): Promise<Child | undefined>;
    addChild(child: Omit<Child, 'id'>): Promise<Child>;
    updateChild(id: string, child: Partial<Child>): Promise<Child>;
    deleteChild(id: string): Promise<void>;
}

// Mock Implementation for Phase 1
class MockChildrenService implements IChildrenService {
    private children: Child[] = [
        {
            id: '1',
            firstName: 'Alice',
            lastName: 'Smith',
            dateOfBirth: '2015-05-15',
            gender: 'Female',
            bloodGroup: 'A+',
            allergies: ['Peanuts'],
            notes: 'Loves painting'
        },
        {
            id: '2',
            firstName: 'Bob',
            lastName: 'Smith',
            dateOfBirth: '2018-08-20',
            gender: 'Male',
            bloodGroup: 'O+',
            notes: 'Very active'
        }
    ];

    async getChildren(): Promise<Child[]> {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        return [...this.children];
    }

    async getChild(id: string): Promise<Child | undefined> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return this.children.find(c => c.id === id);
    }

    async addChild(childData: Omit<Child, 'id'>): Promise<Child> {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newChild: Child = {
            ...childData,
            id: Math.random().toString(36).substr(2, 9)
        };
        this.children.push(newChild);
        return newChild;
    }

    async updateChild(id: string, childUpdate: Partial<Child>): Promise<Child> {
        await new Promise(resolve => setTimeout(resolve, 800));
        const index = this.children.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Child not found');

        this.children[index] = { ...this.children[index], ...childUpdate };
        return this.children[index];
    }

    async deleteChild(id: string): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 800));
        this.children = this.children.filter(c => c.id !== id);
    }
}

// Export a singleton instance
export const childrenService = new MockChildrenService();
