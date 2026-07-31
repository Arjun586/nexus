import { useEffect, useRef, useState, type FormEvent } from "react";

import { getCollaborators, inviteCollaborator } from "../../api/workspace";
import { getUser } from "../../session/user";
import type { Collaborator } from "../../types/collaborator";
import { parseApiError } from "../../utils/parse-api-error";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Skeleton from "../ui/Skeleton";
import Toast from "../ui/Toast";

type MembersModalProps = {
  workspaceId: string;
  ownerId: string;
  onClose: () => void;
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const MembersModal = ({ workspaceId, ownerId, onClose }: MembersModalProps) => {
  const currentUser = getUser();
  const isOwner = currentUser?.id === ownerId;
  const inputRef = useRef<HTMLInputElement>(null);

  // Members list state
  const [members, setMembers] = useState<Collaborator[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  // Invite form state
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCollaborators(workspaceId)
      .then((data) => {
        if (!cancelled) {
          setMembers(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const { message } = parseApiError(err);
          setMembersError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingMembers(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Focus input on render for owner
  useEffect(() => {
    if (isOwner && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOwner]);

  const handleInvite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Email is required.");
      return;
    }

    setIsInviting(true);
    setEmailError(null);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      await inviteCollaborator(workspaceId, { email: trimmed });
      setEmail("");
      setInviteSuccess(`Invited ${trimmed} successfully.`);
      const data = await getCollaborators(workspaceId);
      setMembers(data);
    } catch (err) {
      const { message, fieldErrors } = parseApiError(err);
      setInviteError(message);
      setEmailError(fieldErrors.email ?? null);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Workspace Members"
      description="Manage members and collaborators for this workspace."
      preventBackdropClose={isInviting}
      maxWidth="md"
    >
      {/* Invite Form (owner only) */}
      {isOwner ? (
        <form onSubmit={handleInvite} noValidate className="mb-4 space-y-3 pb-4 border-b border-gray-200">
          {inviteError ? <Toast variant="error" message={inviteError} onClose={() => setInviteError(null)} /> : null}
          {inviteSuccess ? <Toast variant="success" message={inviteSuccess} onClose={() => setInviteSuccess(null)} autoDismiss={true} duration={4000} /> : null}

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                id="invite-email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                  if (inviteError) setInviteError(null);
                  if (inviteSuccess) setInviteSuccess(null);
                }}
                disabled={isInviting}
                error={emailError}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isInviting}
              className="mt-0 shrink-0"
            >
              Invite
            </Button>
          </div>
        </form>
      ) : null}

      {/* Members List */}
      <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
        {isLoadingMembers ? (
          <div className="space-y-3 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton height={28} width={28} variant="circular" />
                  <div className="space-y-1.5 flex-1 max-w-[200px]">
                    <Skeleton height={14} className="w-full" />
                    <Skeleton height={10} className="w-3/4" />
                  </div>
                </div>
                <Skeleton height={20} width={50} />
              </div>
            ))}
          </div>
        ) : membersError ? (
          <Toast variant="error" message={membersError} />
        ) : members.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-500">No members added yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-200">
                    {getInitials(member.user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-900">
                      {member.user.name}
                    </p>
                    <p className="truncate text-[11px] text-gray-500">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                <Badge variant={member.role === "OWNER" ? "owner" : "default"}>
                  {member.role === "OWNER" ? "Owner" : "Member"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default MembersModal;
