import { useEffect, useRef, useState, type FormEvent } from "react";

import { getCollaborators, inviteCollaborator } from "../../api/workspace";
import { getUser } from "../../session/user";
import type { Collaborator } from "../../types/collaborator";
import { parseApiError } from "../../utils/parse-api-error";

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

const RoleBadge = ({ role }: { role: string }) => {
  if (role === "OWNER") {
    return (
      <span className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-medium text-white">
        Owner
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
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

  // Initial fetch — setState calls are in .then/.catch/.finally callbacks
  // (asynchronous), not synchronous in the effect body.
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

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isInviting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isInviting, onClose]);

  // Auto-focus email input on open
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
      setInviteSuccess("Member invited successfully.");
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
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={isInviting ? undefined : onClose}
      />
      <div className="relative flex w-full max-w-lg flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isInviting}
            aria-label="Close members panel"
            className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Invite Form (owner only) */}
        {isOwner ? (
          <div className="border-b border-gray-200 px-6 py-4">
            <form onSubmit={handleInvite} noValidate>
              {inviteError ? (
                <p
                  className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {inviteError}
                </p>
              ) : null}

              {inviteSuccess ? (
                <p className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                  {inviteSuccess}
                </p>
              ) : null}

              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <label htmlFor="invite-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    ref={inputRef}
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                      if (inviteError) setInviteError(null);
                      if (inviteSuccess) setInviteSuccess(null);
                    }}
                    placeholder="Invite by email"
                    disabled={isInviting}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "invite-email-error" : undefined}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 disabled:bg-gray-100"
                  />
                  {emailError ? (
                    <p id="invite-email-error" className="mt-1 text-xs text-red-600">
                      {emailError}
                    </p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="shrink-0 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isInviting ? "Inviting…" : "Invite"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {/* Members List */}
        <div className="max-h-80 overflow-y-auto px-6 py-4">
          {isLoadingMembers ? (
            <p className="text-center text-sm text-gray-500">
              Loading members…
            </p>
          ) : membersError ? (
            <p
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {membersError}
            </p>
          ) : members.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              No members yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {members.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700">
                    {getInitials(member.user.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {member.user.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {member.user.email}
                    </p>
                  </div>
                  <RoleBadge role={member.role} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
