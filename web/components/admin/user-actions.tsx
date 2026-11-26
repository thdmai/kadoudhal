"use client";

import { useActionState } from "react";
import {
  setUserActiveAction,
  setUserRoleAction,
} from "@/app/admin/utilisateurs/actions";
import { useActionToast } from "@/components/toast";
import { useDictionary } from "@/lib/i18n/provider";

type UserActionsProps = {
  userId: string;
  role: "user" | "admin";
  isActive: boolean;
  isSelf: boolean;
};

export function UserActions({
  userId,
  role,
  isActive,
  isSelf,
}: UserActionsProps) {
  const [roleState, roleAction, rolePending] = useActionState(
    setUserRoleAction,
    null,
  );
  const [activeState, activeAction, activePending] = useActionState(
    setUserActiveAction,
    null,
  );

  useActionToast(roleState);
  useActionToast(activeState);
  const dictionary = useDictionary();
  const t = dictionary.admin.users;
  const common = dictionary.admin.common;

  const pending = rolePending || activePending;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isActive ? (
        <form action={roleAction}>
          <input type="hidden" name="userId" value={userId} />
          <input
            type="hidden"
            name="role"
            value={role === "admin" ? "user" : "admin"}
          />
          <button
            type="submit"
            disabled={pending || (isSelf && role === "admin")}
            className="admin-btn admin-btn-ghost"
            title={
              isSelf && role === "admin" ? t.cannotRemoveSelf : undefined
            }
          >
            {role === "admin" ? t.removeAdmin : t.makeAdmin}
          </button>
        </form>
      ) : null}

      <form action={activeAction}>
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="active" value={isActive ? "0" : "1"} />
        <button
          type="submit"
          disabled={pending || (isSelf && isActive)}
          className={
            isActive ? "admin-btn admin-btn-danger" : "admin-btn admin-btn-ghost"
          }
        >
          {isActive ? t.deactivate : common.restore}
        </button>
      </form>
    </div>
  );
}
