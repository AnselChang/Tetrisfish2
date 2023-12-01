/*
Functions that help with generating varied english sentences for qualitative analysis
*/

import { EvalFactor } from "./eval-factors"

// given an eval factor, return a verb phrase that describes it
export function getPositiveEvalFactorPhrase(evalFactor: EvalFactor): string {

    switch (evalFactor) {
        case EvalFactor.SURFACE:
            return "creates a flatter surface";
        case EvalFactor.TETRIS_READY: // a special eval factor that should be handled separately
            return "";
        case EvalFactor.LINE_CLEAR: // a special eval factor that should be handled separately
            return "";
        case EvalFactor.BUILT_OUT_LEFT:
            return "builds out the left";
        case EvalFactor.UNABLE_TO_BURN:
            return "opens up burn options";
        case EvalFactor.GUARANTEED_BURNS:
            return "minimizes the number of burns";
        case EvalFactor.HOLE:
            return "avoids the creation of holes";
        case EvalFactor.HOLE_WEIGHT:
            return "avoids adding weight to holes which would prolong the dig";
        case EvalFactor.EARLY_DOUBLE_WELL:
            return "maintains efficiency by avoiding a double well too early";
        case EvalFactor.COVERED_WELL:
            return "keeps the well open for tetrises";
        case EvalFactor.SPIRE_HEIGHT:
            return "prevents spires from getting out of control";
        case EvalFactor.INPUT_COST:
            return ""; // ignored
        case EvalFactor.AVG_HEIGHT:
            return "keeps the stack at a safe height";
        case EvalFactor.COL9:
            return "avoids building too high in column 9";
        case EvalFactor.INACCESSIBLE_LEFT:
            return "keeps the left side accessible"
    }
}

// given an eval factor, return a verb phrase that describes it
export function getNegativeEvalFactorPhrase(evalFactor: EvalFactor): string {

    switch (evalFactor) {
        case EvalFactor.SURFACE:
            return "creates a bumpier surface";
        case EvalFactor.TETRIS_READY: // a special eval factor that should be handled separately
            return "doesn't get tetris ready";
        case EvalFactor.LINE_CLEAR: // a special eval factor that should be handled separately
            return "";
        case EvalFactor.BUILT_OUT_LEFT:
            return "doesn't give enough attention to the left";
        case EvalFactor.UNABLE_TO_BURN:
            return "cuts off burn options";
        case EvalFactor.GUARANTEED_BURNS:
            return "forces burns";
        case EvalFactor.HOLE:
            return "creates a hole in the stack";
        case EvalFactor.HOLE_WEIGHT:
            return "adds weight to a hole and prolongs the dig";
        case EvalFactor.EARLY_DOUBLE_WELL:
            return "is a bit conservative and creates a double well early";
        case EvalFactor.COVERED_WELL:
            return "covers the well preventing tetrises";
        case EvalFactor.SPIRE_HEIGHT:
            return "creates a dangerous spire that divides the stack";
        case EvalFactor.INPUT_COST:
            return "" // ignored
        case EvalFactor.AVG_HEIGHT:
            return "builds the stack dangerously high";
        case EvalFactor.COL9:
            return "builds too high in column 9";
        case EvalFactor.INACCESSIBLE_LEFT:
            return "dangerously cuts off the left side"
    }
}

// given an eval factor, return a gerund noun phrase that describes it
export function getNegativeNounEvalFactorPhrase(evalFactor: EvalFactor): string {

    switch (evalFactor) {
        case EvalFactor.SURFACE:
            return "creating a worse bumpier surface";
        case EvalFactor.TETRIS_READY: // a special eval factor that should be handled separately
            return "not being ready for a tetris";
        case EvalFactor.LINE_CLEAR: // a special eval factor that should be handled separately
            return "";
        case EvalFactor.BUILT_OUT_LEFT:
            return "a bad left";
        case EvalFactor.UNABLE_TO_BURN:
            return "cutting off burn options";
        case EvalFactor.GUARANTEED_BURNS:
            return "forcing burns";
        case EvalFactor.HOLE:
            return "creating a hole in the stack";
        case EvalFactor.HOLE_WEIGHT:
            return "adding weight to a hole and prolonging the dig";
        case EvalFactor.EARLY_DOUBLE_WELL:
            return "an early double well";
        case EvalFactor.COVERED_WELL:
            return "a covered well";
        case EvalFactor.SPIRE_HEIGHT:
            return "a dangerous spire that divides the stack";
        case EvalFactor.INPUT_COST:
            return "" // ignored
        case EvalFactor.AVG_HEIGHT:
            return "building the stack dangerously high";
        case EvalFactor.COL9:
            return "building too high in column 9";
        case EvalFactor.INACCESSIBLE_LEFT:
            return "having an inaccessible left side"
    }
}