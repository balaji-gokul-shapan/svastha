/**
 * Reusable settings sidebar navigation item.
 * Status is fully controlled by the parent via `active` + `onClick` so the
 * same item can be reused in any settings/sub-navigation.
 */
export function SidebarNavItem({ item, active = false, onClick }) {
  const NavIcon = item.icon;
  return (
    <button
      key={item.id}
      type="button"
      onClick={() => onClick(item.id)}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer ${
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      }`}
    >
      <NavIcon className="size-4" />
      <span className="flex-1 text-left">{item.label}</span>
      {item.badge ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {item.badge}
        </span>
      ) : null}
    </button>
  );
}

export default SidebarNavItem;
