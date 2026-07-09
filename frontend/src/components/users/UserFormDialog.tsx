
import { useEffect, useState } from "react";
import { type User, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff } from "lucide-react";

interface UserFormDialogProps {
    isOpen: boolean;
    onClose: (open: boolean) => void;
    onSubmit: (e: React.FormEvent, data: any) => Promise<void>;
    userToEdit?: User | null;
    isSubmitting: boolean;
}

export function UserFormDialog({ isOpen, onClose, onSubmit, userToEdit, isSubmitting }: UserFormDialogProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>(UserRole.EDITOR);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [resetPasswordMode, setResetPasswordMode] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (userToEdit) {
                setName(userToEdit.name);
                setEmail(userToEdit.email);
                setRole(userToEdit.role);
                setResetPasswordMode(false);
            } else {
                setName("");
                setEmail("");
                setRole(UserRole.EDITOR);
                setPassword("");
                setConfirmPassword("");
                setResetPasswordMode(false);
            }
            setShowPassword(false);
        }
    }, [isOpen, userToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name,
            email,
            role,
            password,
            confirmPassword,
            resetPasswordMode: userToEdit ? resetPasswordMode : true, // Always reset/set password for new user
        };
        onSubmit(e, data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{userToEdit ? "Edit User" : "Add New User"}</DialogTitle>
                        <DialogDescription>
                            {userToEdit ? "Update user details and access." : "Create a new user with specific role access."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="john@example.com"
                                required
                                disabled={!!userToEdit}
                                className={userToEdit ? "bg-muted" : ""}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={role} onValueChange={(val: UserRole) => setRole(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserRole.SUPER_ADMIN}>Super Admin</SelectItem>
                                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                    <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                                    <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(userToEdit && (
                            <div className="flex items-center space-x-2 py-2">
                                <Switch
                                    id="reset-password-mode"
                                    checked={resetPasswordMode}
                                    onCheckedChange={setResetPasswordMode}
                                />
                                <Label htmlFor="reset-password-mode">Reset Password</Label>
                            </div>
                        ))}

                        {(!userToEdit || resetPasswordMode) && (
                            <>
                                <div className="grid gap-2 relative">
                                    <Label htmlFor="password">{userToEdit ? "New Password" : "Password"}</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirmPassword">Confirm {userToEdit ? "New " : ""}Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (userToEdit ? "Updating..." : "Creating...") : (userToEdit ? "Update User" : "Create User")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
