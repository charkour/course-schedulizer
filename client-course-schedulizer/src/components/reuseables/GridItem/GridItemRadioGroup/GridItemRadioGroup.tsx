import { FormControlLabel, FormLabel, Grid, Radio, RadioGroup } from "@material-ui/core";
import React, { ChangeEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import "./GridItemRadioGroup.scss";

interface GridItemRadioGroup {
  control: ReturnType<typeof useForm>["control"];
  defaultValue: string;
  label: string;
  lowercase?: boolean;
  name?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  options: string[];
  register: ReturnType<typeof useForm>["register"];
}

export const GridItemRadioGroup = ({
  control,
  defaultValue,
  label,
  lowercase,
  name,
  onChange,
  options,
  register,
}: GridItemRadioGroup) => {
  return (
    <Grid item xs>
      <FormLabel component="legend">{label}</FormLabel>
      <Controller
        ref={register}
        as={RadioGroup}
        control={control}
        defaultValue={defaultValue}
        name={name || label.toLowerCase()}
      >
        {options.map((o) => {
          return (
            <FormControlLabel
              key={o.toLowerCase()}
              control={<Radio onChange={onChange} />}
              label={o}
              value={lowercase ? o.toLowerCase() : o}
            />
          );
        })}
      </Controller>
    </Grid>
  );
};

GridItemRadioGroup.defaultProps = {
  lowercase: false,
  name: undefined,
  onChange: undefined,
};
