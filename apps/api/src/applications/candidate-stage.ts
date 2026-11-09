// Public progression only: never forward a new/internal staff stage by default.
export function candidateStage(stage:string):string {
  switch(stage){
    case 'preselected':case 'interview':case 'offer':case 'hired':case 'not_selected':return stage;
    default:return 'received';
  }
}
