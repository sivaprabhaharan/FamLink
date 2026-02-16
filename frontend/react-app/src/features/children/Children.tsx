import { useEffect, useState } from 'react';
import { Plus, Calendar, User as UserIcon } from 'lucide-react';
import { childrenService } from './ChildrenService';
import type { Child } from './ChildrenService';
import { AddChildModal } from './AddChildModal';

export function Children() {
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchChildren = async () => {
        try {
            setIsLoading(true);
            const data = await childrenService.getChildren();
            setChildren(data);
        } catch (error) {
            console.error('Failed to fetch children', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    const handleAddChild = async (childData: Omit<Child, 'id'>) => {
        await childrenService.addChild(childData);
        await fetchChildren(); // Refresh list
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Children</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage your family members</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Child
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : children.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No children added</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a family member.</p>
                    <div className="mt-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Add Child
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children.map((child) => (
                        <div key={child.id} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xl font-bold">
                                        {child.firstName.charAt(0)}
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                            {child.firstName} {child.lastName}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {new Date(child.dateOfBirth).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide">Gender</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-200">{child.gender}</span>
                                    </div>
                                    {child.bloodGroup && (
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide">Blood Group</span>
                                            <span className="font-medium text-gray-900 dark:text-gray-200">{child.bloodGroup}</span>
                                        </div>
                                    )}
                                </div>
                                {child.notes && (
                                    <div className="mt-3">
                                        <span className="text-gray-500 dark:text-gray-400 block text-xs uppercase tracking-wide">Notes</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{child.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AddChildModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddChild}
            />
        </div>
    );
}
