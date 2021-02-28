import type { ButtonProps } from "@material-ui/core";
import { AddSectionPopover } from "components";
import React from "react";
import { PopoverButton } from "../PopoverButton";

interface AddSectionButton extends ButtonProps {
  isIcon?: boolean;
}

export const AddSectionButton = (props: AddSectionButton) => {
  const { isIcon } = props;

  return (
    <PopoverButton isIcon={isIcon}>
      <AddSectionPopover />
    </PopoverButton>
  );
};

AddSectionButton.defaultProps = {
  isIcon: true,
};
